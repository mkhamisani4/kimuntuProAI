import { NextRequest, NextResponse } from 'next/server';

const CONSUMER_KNOWLEDGE_BASE: Record<string, {
    overview: string;
    keyPoints: string[];
    requirements: string;
    sources: Array<{ type: 'official' | 'legal'; title: string; url?: string; citation?: string }>;
}> = {
    'Consumer Rights & Protections': {
        overview: 'Federal and state laws protect consumers from unfair, deceptive, and abusive practices.',
        keyPoints: [
            'Right to accurate information about products and services',
            'Right to fair treatment in transactions',
            'Protection from deceptive advertising and unfair practices',
            'Right to dispute billing errors and credit report inaccuracies'
        ],
        requirements: 'Businesses must provide clear disclosures, honor warranties, and comply with consumer protection statutes. Consumers should document issues and file complaints when appropriate.',
        sources: [
            { type: 'official', title: 'FTC Consumer Protection', url: 'https://www.ftc.gov/legal-library/browse/statutes', citation: '15 USC § 45' },
            { type: 'official', title: 'Consumer Financial Protection Bureau', url: 'https://www.consumerfinance.gov', citation: '12 USC § 5491' }
        ]
    },
    'Warranty Disputes': {
        overview: 'Warranties are promises about product quality; federal law provides minimum protections.',
        keyPoints: [
            'Magnuson-Moss Warranty Act: Federal warranty disclosure requirements',
            'Express warranties: Written or verbal promises by seller',
            'Implied warranty of merchantability: Fit for ordinary use',
            'Implied warranty of fitness: For particular purpose if seller knows'
        ],
        requirements: 'Document the defect and warranty terms. Provide notice to seller. Allow reasonable opportunity to cure. State lemon laws may provide additional vehicle protections.',
        sources: [
            { type: 'official', title: 'FTC Magnuson-Moss', url: 'https://www.ftc.gov/legal-library/browse/statutes/magnuson-moss-warranty-act', citation: '15 USC § 2301' },
            { type: 'legal', title: 'UCC Implied Warranties', citation: 'UCC § 2-314, 2-315' }
        ]
    },
    'Fraud & Scam Protection': {
        overview: 'Consumers have rights when victimized by fraud, scams, or identity theft.',
        keyPoints: [
            'Report to FTC at ReportFraud.ftc.gov',
            'Place fraud alert or credit freeze with credit bureaus',
            'File police report for identity theft',
            'Notify banks and creditors of unauthorized transactions'
        ],
        requirements: 'Act quickly to limit damage. Document everything. File reports with FTC, local police, and affected institutions. Consider identity theft protection services.',
        sources: [
            { type: 'official', title: 'FTC Identity Theft', url: 'https://www.identitytheft.gov', citation: '' },
            { type: 'official', title: 'FTC Report Fraud', url: 'https://reportfraud.ftc.gov', citation: '' }
        ]
    },
    'Debt Collection': {
        overview: 'The Fair Debt Collection Practices Act (FDCPA) limits how debt collectors may contact you.',
        keyPoints: [
            'Collectors cannot harass, threaten, or use false statements',
            'Cannot call before 8am or after 9pm (your local time)',
            'Must provide written validation notice within 5 days',
            'You can demand they stop contacting you (in writing)'
        ],
        requirements: 'Send written request to cease contact. Request debt validation. Document all communications. Report violations to CFPB and state AG.',
        sources: [
            { type: 'official', title: 'CFPB Debt Collection', url: 'https://www.consumerfinance.gov/consumer-tools/debt-collection/', citation: '15 USC § 1692' },
            { type: 'legal', title: 'Fair Debt Collection Practices Act', citation: 'FDCPA' }
        ]
    },
    'Product Liability': {
        overview: 'Manufacturers and sellers may be liable for defective products that cause injury.',
        keyPoints: [
            'Design defects: Product inherently dangerous',
            'Manufacturing defects: Flaw in production',
            'Failure to warn: Inadequate instructions or warnings',
            'Strict liability in many jurisdictions for defective products'
        ],
        requirements: 'Preserve the product as evidence. Document injuries and medical treatment. Note when and where product was purchased. Consult personal injury attorney.',
        sources: [
            { type: 'legal', title: 'Restatement (Third) of Torts: Products Liability', citation: '' },
            { type: 'official', title: 'CPSC Product Safety', url: 'https://www.cpsc.gov', citation: '' }
        ]
    },
    'Credit Reporting & Disputes': {
        overview: 'The Fair Credit Reporting Act (FCRA) governs credit reports and your right to dispute errors.',
        keyPoints: [
            'Free annual credit report from each bureau (AnnualCreditReport.com)',
            'Right to dispute inaccurate information',
            'Bureaus must investigate within 30 days',
            'Right to add statement of dispute to file'
        ],
        requirements: 'Submit dispute in writing with supporting documentation. Bureau has 30 days to investigate. If unresolved, consider CFPB complaint or legal action.',
        sources: [
            { type: 'official', title: 'CFPB Credit Reports', url: 'https://www.consumerfinance.gov/consumer-tools/credit-reports-and-scores/', citation: '15 USC § 1681' },
            { type: 'official', title: 'AnnualCreditReport.com', url: 'https://www.annualcreditreport.com', citation: '' }
        ]
    },
    'Lemon Law & Vehicle Defects': {
        overview: 'Lemon laws protect consumers who purchase defective vehicles.',
        keyPoints: [
            'Federal Magnuson-Moss applies to vehicle warranties',
            'State lemon laws vary but typically require multiple repair attempts',
            'Document all repair attempts and days out of service',
            'May entitle you to replacement vehicle or refund'
        ],
        requirements: 'Document every repair visit. Keep all paperwork. State laws vary on number of attempts and out-of-service days. Some states have arbitration programs.',
        sources: [
            { type: 'official', title: 'FTC Auto Warranties', url: 'https://www.ftc.gov/business-guidance/resources/warranties-consumer-guide', citation: '' },
            { type: 'legal', title: 'State Lemon Laws', citation: 'State-specific' }
        ]
    },
    'Unfair & Deceptive Practices': {
        overview: 'FTC Act Section 5 prohibits unfair or deceptive acts or practices affecting commerce.',
        keyPoints: [
            'Deceptive: Material representation likely to mislead reasonable consumer',
            'Unfair: Causes substantial injury not reasonably avoidable',
            'State UDAP laws often provide additional remedies',
            'Private right of action in some states'
        ],
        requirements: 'Document the deceptive practice. File complaint with FTC and state AG. Consider small claims court for smaller amounts. Class actions may be available.',
        sources: [
            { type: 'official', title: 'FTC Act Section 5', url: 'https://www.ftc.gov/legal-library/browse/statutes/federal-trade-commission-act', citation: '15 USC § 45' },
            { type: 'legal', title: 'State Consumer Protection Acts', citation: 'UDAP' }
        ]
    },
    'Refunds & Returns': {
        overview: 'Refund and return rights depend on store policy, warranty, and state law.',
        keyPoints: [
            'No federal right to return; store policy governs unless defective',
            'Defective products: Warranty or implied warranty may require refund/repair',
            'Some states require refund policies to be posted',
            'Credit card chargebacks for undelivered or defective goods'
        ],
        requirements: 'Check store return policy. For defective items, cite warranty. Document attempts to resolve. Consider credit card dispute if merchant unresponsive.',
        sources: [
            { type: 'official', title: 'FTC Consumer Guide', url: 'https://consumer.ftc.gov', citation: '' },
            { type: 'legal', title: 'State retail laws', citation: 'State-specific' }
        ]
    },
    'Consumer Contracts': {
        overview: 'Consumer contracts (terms of service, etc.) are subject to consumer protection scrutiny.',
        keyPoints: [
            'Unconscionable terms may be unenforceable',
            'Arbitration and class action waiver provisions scrutinized',
            'Mandatory arbitration in some contexts (e.g., Dodd-Frank carve-outs)',
            'Clear and conspicuous disclosure required'
        ],
        requirements: 'Read terms before agreeing. Unfair terms may be challenged. Consider opt-out provisions. Document when you were presented with terms.',
        sources: [
            { type: 'official', title: 'CFPB Arbitration', url: 'https://www.consumerfinance.gov/rules-policy/regulations/1026/', citation: '' },
            { type: 'legal', title: 'State unconscionability doctrine', citation: '' }
        ]
    }
};

interface ConsumerRequest {
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

        const body: ConsumerRequest = await request.json();
        const { category, question, context, userId } = body;

        if (!category || !question || !userId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const categoryInfo = CONSUMER_KNOWLEDGE_BASE[category] || {
            overview: `General guidance for ${category} in consumer law.`,
            keyPoints: [
                'Document your issue thoroughly',
                'File complaints with FTC and state attorney general',
                'Consider consulting a consumer rights attorney'
            ],
            requirements: 'Check official consumer protection resources for your specific situation.',
            sources: [
                { type: 'official', title: 'FTC', url: 'https://www.ftc.gov', citation: '' },
                { type: 'official', title: 'CFPB', url: 'https://www.consumerfinance.gov', citation: '' }
            ]
        };

        const answer = generateAnswer(category, question, context, categoryInfo);
        const relatedTopics = getRelatedTopics(category);

        return NextResponse.json({
            answer,
            category,
            sources: categoryInfo.sources,
            relatedTopics,
            disclaimer: 'This information is for general guidance only and does not constitute legal advice. Consumer laws vary by state. For specific advice, please consult with a licensed attorney or your state attorney general\'s office.'
        });
    } catch (error: any) {
        console.error('Consumer Law API Error:', error);
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
    categoryInfo: typeof CONSUMER_KNOWLEDGE_BASE[string]
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
    answer += `<p>Based on consumer protection law, `;
    if (question.toLowerCase().includes('debt') || question.toLowerCase().includes('collector')) {
        answer += 'the FDCPA restricts when and how debt collectors may contact you. You can send a written request to stop contact. They must provide validation of the debt. Report violations to the CFPB.';
    } else if (question.toLowerCase().includes('warranty') || question.toLowerCase().includes('defective')) {
        answer += 'you may have rights under express or implied warranties. Document the defect and your repair attempts. The Magnuson-Moss Act provides federal protections. Consider a written demand letter.';
    } else if (question.toLowerCase().includes('credit') || question.toLowerCase().includes('report')) {
        answer += 'you have the right to dispute inaccurate information. Submit disputes in writing to each credit bureau. They must investigate within 30 days. You can get free reports at AnnualCreditReport.com.';
    } else if (question.toLowerCase().includes('fraud') || question.toLowerCase().includes('scam')) {
        answer += 'report to ReportFraud.ftc.gov and consider a credit freeze. Document everything. Notify your bank and credit card companies. File a police report for identity theft.';
    } else {
        answer += 'please refer to the FTC and CFPB resources. Document your issue and consider filing a complaint. A consumer rights attorney can advise on your specific situation.';
    }
    answer += '</p>\n\n';
    answer += `<p><strong>Next Steps:</strong></p>\n<ul>\n`;
    answer += `<li>Document your issue with dates and details</li>\n`;
    answer += `<li>File a complaint with FTC (ftc.gov) or CFPB (consumerfinance.gov)</li>\n`;
    answer += `<li>Contact your state attorney general's consumer protection division</li>\n`;
    answer += `<li>Consider consulting a consumer rights attorney</li>\n`;
    answer += `</ul>`;
    return answer;
}

function getRelatedTopics(category: string): string[] {
    const topics: Record<string, string[]> = {
        'Debt Collection': ['What is debt validation?', 'Can I sue a debt collector?', 'What if the debt isn\'t mine?'],
        'Warranty Disputes': ['What is the Magnuson-Moss Act?', 'How many repair attempts before lemon law?', 'Can I get a refund for a defective product?'],
        'Credit Reporting & Disputes': ['How do I get a free credit report?', 'How long do negative items stay on my report?', 'What if the bureau won\'t fix the error?'],
        'Fraud & Scam Protection': ['How do I place a credit freeze?', 'What is a fraud alert?', 'Where do I report identity theft?']
    };
    return topics[category] || ['What are my consumer rights?', 'How do I file a complaint?', 'When should I contact an attorney?'];
}
