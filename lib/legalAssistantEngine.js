import OpenAI from 'openai';
import { getLegalAssistantKnowledge } from '@/lib/legalKnowledgeBase';

let cachedClient = null;

function getOpenAIClient() {
    if (cachedClient) return cachedClient;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error('OPENAI_API_KEY is not configured');
    }

    cachedClient = new OpenAI({ apiKey });
    return cachedClient;
}

function normalize(text) {
    return (text || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(Boolean);
}

function scoreDocument(doc, question, category) {
    const queryTerms = normalize(question);
    const docTerms = new Set(normalize(`${doc.title} ${doc.category} ${doc.content}`));

    let score = 0;

    for (const term of queryTerms) {
        if (docTerms.has(term)) score += 2;
    }

    if (category && doc.category === category) score += 6;
    if (question.toLowerCase().includes(doc.title.toLowerCase())) score += 4;

    return score;
}

function retrieveContext(assistantId, question, category) {
    const knowledge = getLegalAssistantKnowledge(assistantId);
    if (!knowledge) {
        throw new Error(`Unknown legal assistant: ${assistantId}`);
    }

    const ranked = knowledge.documents
        .map((doc) => ({ doc, score: scoreDocument(doc, question, category) }))
        .sort((a, b) => b.score - a.score);

    const selected = ranked.filter((item) => item.score > 0).slice(0, 4).map((item) => item.doc);
    const fallback = selected.length > 0 ? selected : knowledge.documents.slice(0, 3);

    return {
        knowledge,
        documents: fallback,
    };
}

function dedupeSources(documents) {
    const seen = new Set();
    const unique = [];

    for (const doc of documents) {
        for (const source of doc.sources || []) {
            const key = `${source.title}|${source.url || ''}|${source.citation || ''}`;
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(source);
            }
        }
    }

    return unique;
}

function buildContextBlock(documents) {
    return documents
        .map((doc, index) => {
            return [
                `Context ${index + 1}`,
                `Title: ${doc.title}`,
                `Category: ${doc.category}`,
                `Content: ${doc.content}`,
            ].join('\n');
        })
        .join('\n\n');
}

function buildFallbackAnswer({ knowledge, question, category, documents }) {
    const categoryLabel = category || knowledge.categories[0];
    const points = documents.map((doc) => `- ${doc.content}`).join('\n');

    return {
        answer: [
            `${knowledge.title}`,
            ``,
            `Category: ${categoryLabel}`,
            ``,
            `Based on the retrieved legal context, here are the main points relevant to your question "${question}":`,
            points,
            ``,
            `This is a retrieval-based fallback response because the OpenAI generation step was unavailable.`,
        ].join('\n'),
        followUps: knowledge.categories.slice(0, 3).map((item) => `Help me with ${item.toLowerCase()}.`),
    };
}

export async function runLegalAssistant({
    assistantId,
    question,
    category,
    history = [],
}) {
    const { knowledge, documents } = retrieveContext(assistantId, question, category);
    const sources = dedupeSources(documents);
    const contextBlock = buildContextBlock(documents);
    const recentHistory = history.slice(-6).map((message) => ({
        role: message.role === 'assistant' ? 'assistant' : 'user',
        content: message.content,
    }));

    let payload;

    try {
        const client = getOpenAIClient();
        const model = process.env.OPENAI_LEGAL_MODEL || 'gpt-4.1-mini';

        const completion = await client.chat.completions.create({
            model,
            temperature: 0.2,
            response_format: { type: 'json_object' },
            messages: [
                {
                    role: 'system',
                    content: [
                        `You are ${knowledge.title}.`,
                        `You provide careful legal information and preparation guidance, not legal advice.`,
                        `Use the retrieved context as your primary grounding.`,
                        `If the context is incomplete, say what is uncertain instead of inventing authority.`,
                        `Do not claim to be a lawyer.`,
                        `Prefer practical structure: issue, what matters, what documents or facts to gather, and sensible next steps.`,
                        `Do not use markdown tables.`,
                        `Return strict JSON with keys "answer" and "followUps".`,
                        `The "answer" must be plain text with short paragraphs and optional bullet lines starting with "- ".`,
                        `The "followUps" value must be an array of 3 short suggested follow-up questions.`,
                    ].join('\n'),
                },
                ...recentHistory,
                {
                    role: 'user',
                    content: [
                        `Assistant: ${knowledge.title}`,
                        `Category: ${category || 'General'}`,
                        `User question: ${question}`,
                        ``,
                        `Retrieved legal context:`,
                        contextBlock,
                    ].join('\n'),
                },
            ],
        });

        const raw = completion.choices?.[0]?.message?.content || '{}';
        payload = JSON.parse(raw);
    } catch (error) {
        console.error('[Legal Assistant Engine] OpenAI generation failed:', error);
        payload = buildFallbackAnswer({ knowledge, question, category, documents });
    }

    const relatedTopics = Array.isArray(payload.followUps) && payload.followUps.length > 0
        ? payload.followUps.slice(0, 3)
        : knowledge.categories.slice(0, 3).map((item) => `Help me with ${item.toLowerCase()}.`);

    return {
        answer: typeof payload.answer === 'string' ? payload.answer.trim() : buildFallbackAnswer({ knowledge, question, category, documents }).answer,
        category: category || knowledge.categories[0],
        sources,
        relatedTopics,
        disclaimer: knowledge.disclaimer,
        retrievedContext: documents.map((doc) => ({
            id: doc.id,
            title: doc.title,
            category: doc.category,
        })),
    };
}

export function verifyLegalAssistantPayload(body) {
    if (!body?.category || !body?.question || !body?.userId) {
        throw new Error('Missing required fields');
    }
}
