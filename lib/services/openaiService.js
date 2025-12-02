/**
 * OpenAI API Service
 * Handles all interactions with OpenAI API
 */

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Check if OpenAI API key is configured
 */
export const isConfigured = () => {
    return Boolean(OPENAI_API_KEY && OPENAI_API_KEY !== '' && !OPENAI_API_KEY.includes('your_'));
};

/**
 * Make a request to OpenAI API
 */
const callOpenAI = async (messages, options = {}) => {
    if (!isConfigured()) {
        throw new Error('OpenAI API key not configured. Please add NEXT_PUBLIC_OPENAI_API_KEY to your .env file.');
    }

    try {
        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: options.model || 'gpt-3.5-turbo',
                messages,
                temperature: options.temperature || 0.7,
                max_tokens: options.max_tokens || 500,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'OpenAI API request failed');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('OpenAI API Error:', error);
        throw error;
    }
};

/**
 * Generate project ideas based on category and preferences
 */
export const generateProjectIdeas = async (category, userPreferences = '') => {
    const prompt = `Generate 3 innovative project ideas for the ${category} category.
${userPreferences ? `User preferences: ${userPreferences}` : ''}

For each idea, provide:
1. A catchy title (max 10 words)
2. A brief description (2-3 sentences)

Format as a JSON array with objects containing 'title' and 'description' fields.`;

    const messages = [
        {
            role: 'system',
            content: 'You are an innovation expert helping professionals develop creative project ideas.'
        },
        { role: 'user', content: prompt }
    ];

    try {
        const response = await callOpenAI(messages, { max_tokens: 800 });
        // Extract JSON from response (handle potential markdown code blocks)
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(response);
    } catch (error) {
        console.error('Error generating project ideas:', error);
        throw new Error('Failed to generate project ideas. Please try again.');
    }
};

/**
 * Generate project title suggestions
 */
export const generateTitleSuggestions = async (description, category) => {
    const prompt = `Based on this project description: "${description}"
Category: ${category}

Generate 5 catchy, professional project titles (max 10 words each).
Return as a JSON array of strings.`;

    const messages = [
        { role: 'system', content: 'You are a creative naming expert.' },
        { role: 'user', content: prompt }
    ];

    try {
        const response = await callOpenAI(messages, { max_tokens: 300 });
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(response);
    } catch (error) {
        console.error('Error generating titles:', error);
        throw new Error('Failed to generate title suggestions.');
    }
};

/**
 * Enhance project description with AI
 */
export const enhanceDescription = async (currentDescription, category) => {
    const prompt = `Improve and expand this project description while keeping it concise (3-4 sentences):
"${currentDescription}"

Category: ${category}

Make it more professional, clear, and compelling. Return only the enhanced description, no additional text.`;

    const messages = [
        { role: 'system', content: 'You are an expert at crafting compelling project descriptions.' },
        { role: 'user', content: prompt }
    ];

    try {
        return await callOpenAI(messages, { max_tokens: 300 });
    } catch (error) {
        console.error('Error enhancing description:', error);
        throw new Error('Failed to enhance description.');
    }
};

/**
 * Generate market analysis for project category
 */
export const generateMarketAnalysis = async (category, projectTitle) => {
    const prompt = `Provide a brief market analysis for a project in the ${category} category.
Project: ${projectTitle}

Include:
1. Current market trends (2-3 points)
2. Target audience
3. Potential opportunities
4. Key competitors or challenges

Keep it concise and actionable (max 200 words).`;

    const messages = [
        { role: 'system', content: 'You are a market research analyst.' },
        { role: 'user', content: prompt }
    ];

    try {
        return await callOpenAI(messages, { max_tokens: 500 });
    } catch (error) {
        console.error('Error generating market analysis:', error);
        throw new Error('Failed to generate market analysis.');
    }
};

/**
 * Recommend resources for the project
 */
export const recommendResources = async (projectDescription, category) => {
    const prompt = `Based on this project: "${projectDescription}"
Category: ${category}

Recommend 5-7 essential resources needed, including:
- Technical tools/platforms
- Team roles
- Budget considerations
- Time investment

Return as a JSON array of strings.`;

    const messages = [
        { role: 'system', content: 'You are a project planning expert.' },
        { role: 'user', content: prompt }
    ];

    try {
        const response = await callOpenAI(messages, { max_tokens: 400 });
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(response);
    } catch (error) {
        console.error('Error recommending resources:', error);
        throw new Error('Failed to generate resource recommendations.');
    }
};

/**
 * Identify potential challenges and risks
 */
export const identifyChallenges = async (projectDescription, category) => {
    const prompt = `For this project: "${projectDescription}"
Category: ${category}

Identify 4-5 potential challenges or risks and provide brief mitigation strategies.
Return as a JSON array of objects with 'challenge' and 'mitigation' fields.`;

    const messages = [
        { role: 'system', content: 'You are a risk management consultant.' },
        { role: 'user', content: prompt }
    ];

    try {
        const response = await callOpenAI(messages, { max_tokens: 500 });
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(response);
    } catch (error) {
        console.error('Error identifying challenges:', error);
        throw new Error('Failed to identify challenges.');
    }
};

/**
 * Generate project goals
 */
export const generateGoals = async (projectDescription, category) => {
    const prompt = `Based on this project: "${projectDescription}"
Category: ${category}

Generate 3-5 SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound).
Return as a JSON array of strings.`;

    const messages = [
        { role: 'system', content: 'You are a strategic planning expert.' },
        { role: 'user', content: prompt }
    ];

    try {
        const response = await callOpenAI(messages, { max_tokens: 400 });
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(response);
    } catch (error) {
        console.error('Error generating goals:', error);
        throw new Error('Failed to generate goals.');
    }
};

/**
 * Get AI brainstorming assistance
 */
export const getBrainstormingHelp = async (topic, context = '') => {
    const prompt = `Help me brainstorm about: ${topic}
${context ? `Context: ${context}` : ''}

Provide creative insights, questions to consider, and potential directions to explore.`;

    const messages = [
        { role: 'system', content: 'You are a creative brainstorming partner.' },
        { role: 'user', content: prompt }
    ];

    try {
        return await callOpenAI(messages, { max_tokens: 600 });
    } catch (error) {
        console.error('Error with brainstorming:', error);
        throw new Error('Failed to generate brainstorming insights.');
    }
};
