import { NextRequest, NextResponse } from 'next/server';

const BUSINESS_KNOWLEDGE_BASE: Record<string, {
    overview: string;
    keyPoints: string[];
    requirements: string;
    sources: Array<{ type: 'official' | 'legal'; title: string; url?: string; citation?: string }>;
}> = {
    'Business Formation (LLC, Corp, Partnership)': {
        overview: 'Business formation involves choosing the right entity type and registering with state authorities.',
        keyPoints: [
            'LLC: Limited liability, pass-through taxation, flexible management',
            'Corporation: C-corp or S-corp, formal structure, stock issuance',
            'Partnership: General or limited, shared liability and profits',
            'Sole proprietorship: Simplest form, no separate legal entity'
        ],
        requirements: 'File articles of organization/incorporation with the state, obtain EIN from IRS, create operating agreement or bylaws, obtain necessary business licenses.',
        sources: [
            { type: 'official', title: 'IRS Business Structures', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/business-structures', citation: '26 USC' },
            { type: 'legal', title: 'State Secretary of State Offices', citation: 'State-specific filing requirements' }
        ]
    },
    'Corporate Compliance & Governance': {
        overview: 'Corporate governance ensures proper oversight, transparency, and legal compliance.',
        keyPoints: [
            'Board of directors fiduciary duties: care, loyalty, good faith',
            'Annual meetings and record-keeping requirements',
            'Shareholder rights and disclosure obligations',
            'Sarbanes-Oxley and Dodd-Frank for public companies'
        ],
        requirements: 'Maintain corporate records, hold annual meetings, file annual reports with state, comply with securities laws if applicable.',
        sources: [
            { type: 'legal', title: 'Model Business Corporation Act', citation: 'MBCA § 8.01' },
            { type: 'official', title: 'SEC Corporate Governance', url: 'https://www.sec.gov/spotlight/dir-nominations.htm', citation: '' }
        ]
    },
    'Intellectual Property (Trademarks, Patents, Copyrights)': {
        overview: 'IP protection safeguards your business assets including names, inventions, and creative works.',
        keyPoints: [
            'Trademarks: Protect brand names, logos, and trade dress',
            'Patents: Protect inventions and processes (utility, design, plant)',
            'Copyrights: Protect original works of authorship',
            'Trade secrets: Protect confidential business information'
        ],
        requirements: 'Trademark: USPTO registration. Patent: USPTO application with claims. Copyright: Automatic upon fixation; registration for statutory damages.',
        sources: [
            { type: 'official', title: 'USPTO', url: 'https://www.uspto.gov', citation: '15 USC (trademarks), 35 USC (patents)' },
            { type: 'official', title: 'Copyright Office', url: 'https://www.copyright.gov', citation: '17 USC' }
        ]
    },
    'Employment Law & HR': {
        overview: 'Employment law governs the relationship between employers and employees.',
        keyPoints: [
            'At-will employment (with exceptions) in most states',
            'FLSA: Minimum wage, overtime, child labor',
            'Title VII: Anti-discrimination (race, sex, religion, etc.)',
            'ADA, FMLA, OSHA compliance requirements'
        ],
        requirements: 'Maintain proper employment records, provide required notices, comply with wage and hour laws, implement anti-discrimination policies.',
        sources: [
            { type: 'official', title: 'DOL Employment Laws', url: 'https://www.dol.gov/general/topic', citation: '29 USC' },
            { type: 'official', title: 'EEOC', url: 'https://www.eeoc.gov', citation: '42 USC § 2000e' }
        ]
    },
    'Commercial Contracts': {
        overview: 'Commercial contracts govern business transactions and relationships.',
        keyPoints: [
            'Essential elements: Offer, acceptance, consideration',
            'Key terms: Scope, payment, termination, liability limits',
            'NDAs, service agreements, purchase orders',
            'Choice of law and dispute resolution clauses'
        ],
        requirements: 'Clear terms, mutual assent, consideration. Written contracts recommended for significant transactions.',
        sources: [
            { type: 'legal', title: 'Uniform Commercial Code', citation: 'UCC Article 2' },
            { type: 'legal', title: 'Restatement (Second) of Contracts', citation: '' }
        ]
    },
    'Securities & Financing': {
        overview: 'Securities laws regulate how businesses raise capital.',
        keyPoints: [
            'Securities Act of 1933: Registration or exemption',
            'Regulation D: Private placement exemptions (506b, 506c)',
            'Crowdfunding under Regulation CF',
            'Accredited investor requirements'
        ],
        requirements: 'Register securities or qualify for exemption, provide disclosures, comply with state blue sky laws.',
        sources: [
            { type: 'official', title: 'SEC Regulation D', url: 'https://www.sec.gov/regulations', citation: '17 CFR § 230.501' },
            { type: 'official', title: 'SEC Crowdfunding', url: 'https://www.sec.gov/smallbusiness', citation: '' }
        ]
    },
    'Mergers & Acquisitions': {
        overview: 'M&A transactions involve combining or acquiring businesses through various structures.',
        keyPoints: [
            'Asset purchase vs. stock purchase considerations',
            'Due diligence: Financial, legal, operational',
            'Representations and warranties',
            'Regulatory approvals (Hart-Scott-Rodino for large deals)'
        ],
        requirements: 'Thorough due diligence, proper documentation, regulatory filings if thresholds met, shareholder approval for significant transactions.',
        sources: [
            { type: 'official', title: 'FTC Merger Review', url: 'https://www.ftc.gov/enforcement/mergers', citation: '15 USC § 18a' },
            { type: 'legal', title: 'Delaware General Corporation Law', citation: 'DGCL § 251' }
        ]
    },
    'Tax & Regulatory Compliance': {
        overview: 'Businesses must comply with federal, state, and local tax and regulatory requirements.',
        keyPoints: [
            'Federal income tax, employment taxes, excise taxes',
            'State income tax, sales tax, franchise tax',
            'Industry-specific regulations (FDA, EPA, etc.)',
            'Record retention requirements'
        ],
        requirements: 'File tax returns, pay estimated taxes, maintain records (typically 7 years), obtain required permits and licenses.',
        sources: [
            { type: 'official', title: 'IRS Business Taxes', url: 'https://www.irs.gov/businesses', citation: '26 USC' },
            { type: 'official', title: 'SBA Permits & Licenses', url: 'https://www.sba.gov/business-guide', citation: '' }
        ]
    },
    'Business Disputes & Litigation': {
        overview: 'Business disputes may be resolved through negotiation, mediation, arbitration, or litigation.',
        keyPoints: [
            'Contract disputes and breach of contract',
            'Partnership and shareholder disputes',
            'Alternative dispute resolution (ADR) options',
            'Statute of limitations vary by claim type'
        ],
        requirements: 'Document preservation, notice requirements, consider mediation before litigation. Consult counsel for specific claims.',
        sources: [
            { type: 'legal', title: 'Federal Rules of Civil Procedure', citation: 'FRCP' },
            { type: 'legal', title: 'State Civil Procedure', citation: 'State-specific' }
        ]
    }
};

interface BusinessRequest {
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

        const body: BusinessRequest = await request.json();
        const { category, question, context, userId } = body;

        if (!category || !question || !userId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const categoryInfo = BUSINESS_KNOWLEDGE_BASE[category] || {
            overview: `General guidance for ${category} in business law.`,
            keyPoints: [
                'Consult official government resources and legal counsel',
                'Business laws vary by jurisdiction and industry',
                'Keep thorough records and documentation'
            ],
            requirements: 'Check state and federal requirements for your specific situation.',
            sources: [
                { type: 'official', title: 'SBA', url: 'https://www.sba.gov', citation: '' },
                { type: 'official', title: 'IRS', url: 'https://www.irs.gov', citation: '' }
            ]
        };

        const answer = generateAnswer(category, question, context, categoryInfo);
        const relatedTopics = getRelatedTopics(category);

        return NextResponse.json({
            answer,
            category,
            sources: categoryInfo.sources,
            relatedTopics,
            disclaimer: 'This information is for general guidance only and does not constitute legal advice. Business laws vary by jurisdiction. For specific advice, please consult with a licensed attorney.'
        });
    } catch (error: any) {
        console.error('Business Law API Error:', error);
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
    categoryInfo: typeof BUSINESS_KNOWLEDGE_BASE[string]
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
    answer += `<p>Based on general business law principles, `;
    if (question.toLowerCase().includes('form') || question.toLowerCase().includes('start')) {
        answer += 'you should research your state\'s specific requirements for business formation. Most states have online filing systems. Consider consulting a business attorney for entity selection and formation.';
    } else if (question.toLowerCase().includes('trademark') || question.toLowerCase().includes('patent')) {
        answer += 'IP protection requires proper registration with the USPTO. Conduct a search first to ensure your mark or invention is available. Professional assistance is recommended for patents.';
    } else if (question.toLowerCase().includes('employ') || question.toLowerCase().includes('hire')) {
        answer += 'employment law compliance includes wage/hour requirements, anti-discrimination, and workplace safety. Maintain proper documentation and consider an HR consultant or employment attorney.';
    } else {
        answer += 'please refer to the official resources and consider consulting with a licensed attorney for personalized advice.';
    }
    answer += '</p>\n\n';
    answer += `<p><strong>Next Steps:</strong></p>\n<ul>\n`;
    answer += `<li>Review official government resources for your jurisdiction</li>\n`;
    answer += `<li>Gather necessary documentation</li>\n`;
    answer += `<li>Consider consulting with a business attorney</li>\n`;
    answer += `</ul>`;
    return answer;
}

function getRelatedTopics(category: string): string[] {
    const topics: Record<string, string[]> = {
        'Business Formation (LLC, Corp, Partnership)': ['What are the tax implications of each entity type?', 'Do I need an operating agreement?', 'How do I get an EIN?'],
        'Intellectual Property (Trademarks, Patents, Copyrights)': ['How long does trademark registration take?', 'What is the difference between TM and ®?', 'When should I file a patent?'],
        'Employment Law & HR': ['What employee handbook policies are required?', 'How do I handle termination properly?', 'What are the overtime rules?'],
        'Commercial Contracts': ['What should be in a service agreement?', 'How do I limit liability in contracts?', 'When do I need an NDA?']
    };
    return topics[category] || ['What documents do I need?', 'What are the key compliance requirements?', 'When should I consult an attorney?'];
}
