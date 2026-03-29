import { NextRequest, NextResponse } from 'next/server';

const CONTRACT_KNOWLEDGE_BASE: Record<string, {
    overview: string;
    keyPoints: string[];
    requirements: string;
    sources: Array<{ type: 'official' | 'legal'; title: string; url?: string; citation?: string }>;
}> = {
    'Contract Formation & Validity': {
        overview: 'A valid contract requires offer, acceptance, consideration, capacity, and legality.',
        keyPoints: [
            'Offer: Clear, definite terms communicated to offeree',
            'Acceptance: Unconditional assent to offer terms',
            'Consideration: Something of value exchanged (bargained-for exchange)',
            'Capacity: Parties must have legal capacity to contract',
            'Legality: Purpose must be legal'
        ],
        requirements: 'Written contracts required for certain transactions (Statute of Frauds): real estate, contracts over one year, sale of goods over $500).',
        sources: [
            { type: 'legal', title: 'Restatement (Second) of Contracts', citation: '§ 2, 17, 71' },
            { type: 'legal', title: 'Uniform Commercial Code', citation: 'UCC § 2-201' }
        ]
    },
    'Contract Terms & Interpretation': {
        overview: 'Contract terms are interpreted according to intent, plain meaning, and industry custom.',
        keyPoints: [
            'Four corners rule: Interpret within document context',
            'Parol evidence rule: Extrinsic evidence generally excluded for integrated contracts',
            'Ambiguity: Construed against drafter (contra proferentem)',
            'Key terms: Scope, payment, termination, liability, indemnification'
        ],
        requirements: 'Clear, unambiguous language. Define key terms. Include dispute resolution clauses.',
        sources: [
            { type: 'legal', title: 'Restatement (Second) of Contracts', citation: '§ 200-204' },
            { type: 'legal', title: 'UCC Article 2', citation: 'Sale of goods' }
        ]
    },
    'Breach of Contract': {
        overview: 'Breach occurs when a party fails to perform contractual obligations without legal excuse.',
        keyPoints: [
            'Material breach: Substantial failure, non-breaching party may suspend performance',
            'Anticipatory breach: Repudiation before performance due',
            'Defenses: Impossibility, frustration, impracticability, waiver',
            'Mitigation: Non-breaching party must mitigate damages'
        ],
        requirements: 'Document the breach, provide notice if required. Preserve evidence. Consider cure period.',
        sources: [
            { type: 'legal', title: 'Restatement (Second) of Contracts', citation: '§ 235, 250-261' },
            { type: 'legal', title: 'UCC § 2-610, 2-711', citation: '' }
        ]
    },
    'Remedies & Damages': {
        overview: 'Contract remedies aim to put non-breaching party in position of full performance.',
        keyPoints: [
            'Expectation damages: Lost benefit of bargain',
            'Reliance damages: Out-of-pocket costs incurred',
            'Specific performance: When damages inadequate (e.g., unique goods)',
            'Liquidated damages: Must be reasonable estimate of actual damages'
        ],
        requirements: 'Prove damages with reasonable certainty. Causation link. Mitigation efforts.',
        sources: [
            { type: 'legal', title: 'Restatement (Second) of Contracts', citation: '§ 344-378' },
            { type: 'legal', title: 'Hadley v. Baxendale', citation: 'Foreseeability rule' }
        ]
    },
    'Contract Negotiation': {
        overview: 'Effective negotiation involves preparation, understanding leverage, and clear communication.',
        keyPoints: [
            'Know your BATNA (Best Alternative to Negotiated Agreement)',
            'Identify must-haves vs. nice-to-haves',
            'Understand counterparty interests',
            'Document all agreed terms in writing'
        ],
        requirements: 'Prepare thoroughly. Get terms in writing. Consider attorney review for significant deals.',
        sources: [
            { type: 'legal', title: 'Contract negotiation best practices', citation: '' },
            { type: 'official', title: 'FTC Business Guidance', url: 'https://www.ftc.gov/business-guidance', citation: '' }
        ]
    },
    'NDAs & Confidentiality': {
        overview: 'NDAs protect sensitive information shared during business discussions.',
        keyPoints: [
            'Define confidential information clearly',
            'Specify permitted use and disclosure',
            'Include exclusions (public info, independently developed)',
            'Duration and return/destruction of materials'
        ],
        requirements: 'Define scope narrowly. Include carve-outs. Consider mutual vs. one-way NDA.',
        sources: [
            { type: 'legal', title: 'Trade secret law (Uniform Trade Secrets Act)', citation: 'UTSA' },
            { type: 'legal', title: 'Defend Trade Secrets Act', citation: '18 USC § 1836' }
        ]
    },
    'Service Agreements': {
        overview: 'Service agreements govern the provision of services between parties.',
        keyPoints: [
            'Scope of services and deliverables',
            'Payment terms and schedule',
            'Term and termination provisions',
            'Indemnification and limitation of liability',
            'IP ownership of work product'
        ],
        requirements: 'Clearly define scope. Include change order process. Address termination and transition.',
        sources: [
            { type: 'legal', title: 'Restatement (Second) of Contracts', citation: '' },
            { type: 'legal', title: 'State contract law', citation: 'Jurisdiction-specific' }
        ]
    },
    'Lease & Real Estate Contracts': {
        overview: 'Real estate contracts require specific formalities under the Statute of Frauds.',
        keyPoints: [
            'Must be in writing for enforceability',
            'Key terms: Parties, property, price, duration',
            'Landlord-tenant laws vary by jurisdiction',
            'Commercial vs. residential different rules'
        ],
        requirements: 'Written agreement. Comply with state landlord-tenant laws. Include maintenance and repair clauses.',
        sources: [
            { type: 'legal', title: 'Statute of Frauds', citation: 'State-specific' },
            { type: 'official', title: 'HUD Tenant Rights', url: 'https://www.hud.gov', citation: '' }
        ]
    },
    'Employment Contracts': {
        overview: 'Employment contracts define the relationship between employer and employee.',
        keyPoints: [
            'At-will presumption (with exceptions)',
            'Non-compete and non-solicit enforceability varies by state',
            'Severance and termination provisions',
            'Confidentiality and IP assignment'
        ],
        requirements: 'Clear terms. Consider state restrictions on non-competes. Document consideration for restrictive covenants.',
        sources: [
            { type: 'official', title: 'DOL Employment Law', url: 'https://www.dol.gov', citation: '' },
            { type: 'legal', title: 'State employment law', citation: 'Varies by state' }
        ]
    },
    'Consumer Contracts': {
        overview: 'Consumer contracts are subject to additional protections and disclosure requirements.',
        keyPoints: [
            'Unconscionability: Unfair terms may be unenforceable',
            'Mandatory arbitration and class action waivers scrutinized',
            'FTC and state consumer protection laws',
            'Right to cancel in certain contexts (e.g., door-to-door)'
        ],
        requirements: 'Clear, conspicuous disclosure. Avoid unfair surprise. Comply with consumer protection statutes.',
        sources: [
            { type: 'official', title: 'FTC Consumer Protection', url: 'https://www.ftc.gov/legal-library/browse/statutes', citation: '' },
            { type: 'legal', title: 'State consumer protection acts', citation: 'UDAAP' }
        ]
    }
};

interface ContractRequest {
    category: string;
    question: string;
    context?: string;
    userId: string;
}

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            if (token !== 'mock-token' && process.env.NODE_ENV === 'production') {
                try {
                    const { getAuth } = await import('firebase-admin/auth');
                    const { adminApp } = await import('@/lib/firebase-admin');
                    const auth = getAuth(adminApp as any);
                    await auth.verifyIdToken(token);
                } catch {
                    return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
                }
            }
        }

        const body: ContractRequest = await request.json();
        const { category, question, context, userId } = body;

        if (!category || !question || !userId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const categoryInfo = CONTRACT_KNOWLEDGE_BASE[category] || {
            overview: `General guidance for ${category} in contract law.`,
            keyPoints: [
                'Ensure all essential terms are in writing',
                'Understand your rights and obligations',
                'Consider attorney review for significant contracts'
            ],
            requirements: 'Consult with a licensed attorney for contract-specific advice.',
            sources: [
                { type: 'legal', title: 'Restatement (Second) of Contracts', citation: '' },
                { type: 'legal', title: 'Uniform Commercial Code', citation: '' }
            ]
        };

        const answer = generateAnswer(category, question, context, categoryInfo);
        const relatedTopics = getRelatedTopics(category);

        return NextResponse.json({
            answer,
            category,
            sources: categoryInfo.sources,
            relatedTopics,
            disclaimer: 'This information is for general guidance only and does not constitute legal advice. Contract law varies by jurisdiction. For specific advice, please consult with a licensed attorney.'
        });
    } catch (error: any) {
        console.error('Contract Law API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

function generateAnswer(
    category: string,
    question: string,
    context: string | undefined,
    categoryInfo: typeof CONTRACT_KNOWLEDGE_BASE[string]
): string {
    let answer = `<h3>${category}</h3>\n\n`;
    answer += `<p><strong>Overview:</strong> ${categoryInfo.overview}</p>\n\n`;
    answer += `<p><strong>Key Points:</strong></p>\n<ul>\n`;
    categoryInfo.keyPoints.forEach((point) => {
        answer += `<li>${point}</li>\n`;
    });
    answer += `</ul>\n\n`;
    answer += `<p><strong>Requirements:</strong> ${categoryInfo.requirements}</p>\n\n`;
    if (context) {
        answer += `<p><strong>Regarding your situation:</strong> ${context}</p>\n\n`;
    }
    answer += `<p><strong>Regarding your question "${question}":</strong></p>\n`;
    answer += `<p>Based on general contract law principles, `;
    if (question.toLowerCase().includes('binding') || question.toLowerCase().includes('valid')) {
        answer += 'a contract is generally binding when there is offer, acceptance, and consideration. Written form may be required for certain types of agreements under the Statute of Frauds.';
    } else if (question.toLowerCase().includes('breach')) {
        answer += 'breach occurs when a party fails to perform. The non-breaching party may have remedies including damages, specific performance, or cancellation. Document the breach and consider mitigation.';
    } else if (question.toLowerCase().includes('nda') || question.toLowerCase().includes('confidential')) {
        answer += 'NDAs should clearly define what information is confidential, the permitted use, exclusions, and duration. Consider whether mutual or one-way protection is appropriate.';
    } else {
        answer += 'please refer to the legal sources and consider consulting with a licensed attorney for personalized advice on your specific contract.';
    }
    answer += '</p>\n\n';
    answer += `<p><strong>Next Steps:</strong></p>\n<ul>\n`;
    answer += `<li>Review the contract terms carefully</li>\n`;
    answer += `<li>Document any concerns or ambiguities</li>\n`;
    answer += `<li>Consider having an attorney review significant contracts</li>\n`;
    answer += `</ul>`;
    return answer;
}

function getRelatedTopics(category: string): string[] {
    const topics: Record<string, string[]> = {
        'Contract Formation & Validity': ['Can a verbal agreement be enforced?', 'What is consideration?', 'When is a contract void?'],
        'Breach of Contract': ['What damages can I recover?', 'What is anticipatory breach?', 'Do I need to give notice before suing?'],
        'Remedies & Damages': ['What are expectation damages?', 'When can I get specific performance?', 'Are liquidated damages enforceable?'],
        'NDAs & Confidentiality': ['How long should an NDA last?', 'What are common NDA exclusions?', 'When is an NDA mutual vs. one-way?']
    };
    return topics[category] || ['What terms are essential?', 'How do I interpret ambiguous language?', 'When should I consult an attorney?'];
}
