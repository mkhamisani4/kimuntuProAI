import { NextRequest, NextResponse } from 'next/server';

// Avoid initializing Firebase Admin at module load (mock adminApp would crash getAuth/getFirestore).
// Auth is optional in development so the assistant works without a token.

// Immigration law knowledge base (simplified - in production, use a vector database)
const IMMIGRATION_KNOWLEDGE_BASE = {
    US: {
        'Visa Types (H-1B, F-1, etc.)': {
            overview: 'The United States offers various non-immigrant visa categories for temporary stays',
            keyPoints: [
                'H-1B: Specialty occupation workers, requires bachelor\'s degree or equivalent',
                'F-1: Academic students enrolled in accredited institutions',
                'J-1: Exchange visitors for educational and cultural programs',
                'L-1: Intracompany transferees for managers and specialized knowledge workers',
                'O-1: Individuals with extraordinary ability in sciences, arts, education, business, or athletics'
            ],
            requirements: 'Visa requirements vary by category but generally include valid passport, completed application forms, interview appointment, and supporting documentation',
            sources: [
                {
                    type: 'official' as const,
                    title: 'USCIS Visa Categories',
                    url: 'https://www.uscis.gov/working-in-the-united-states/temporary-nonimmigrant-workers',
                    citation: '8 USC § 1101(a)(15)'
                }
            ]
        },
        'Green Card/Permanent Residence': {
            overview: 'A green card gives you official immigration status (lawful permanent residence) in the United States',
            keyPoints: [
                'Family-based green cards available for immediate relatives and family preference categories',
                'Employment-based green cards categorized into five preference categories (EB-1 through EB-5)',
                'Diversity Visa Lottery program available for qualifying countries',
                'Asylum and refugee pathways to permanent residence',
                'Processing times vary by category, typically 6 months to several years'
            ],
            requirements: 'Eligibility depends on relationship to sponsor, employment category, or qualifying criteria. Requires medical examination, background check, and financial sponsorship',
            sources: [
                {
                    type: 'official' as const,
                    title: 'USCIS Green Card Overview',
                    url: 'https://www.uscis.gov/green-card',
                    citation: 'INA § 201, 203'
                }
            ]
        },
        'Citizenship & Naturalization': {
            overview: 'Naturalization is the process by which U.S. citizenship is granted to a foreign citizen or national after they meet certain requirements',
            keyPoints: [
                'Must be at least 18 years old',
                'Continuous residence and physical presence requirements (typically 5 years, or 3 if married to US citizen)',
                'Good moral character requirement',
                'English language proficiency and civics knowledge',
                'Oath of allegiance to the United States'
            ],
            requirements: 'Form N-400, biometrics appointment, interview, and naturalization test covering English and US civics',
            sources: [
                {
                    type: 'official' as const,
                    title: 'Citizenship Through Naturalization',
                    url: 'https://www.uscis.gov/citizenship/learn-about-citizenship/citizenship-and-naturalization',
                    citation: 'INA § 316'
                }
            ]
        }
    },
    Canada: {
        'Express Entry System': {
            overview: 'Express Entry is Canada\'s main immigration pathway for skilled workers',
            keyPoints: [
                'Manages applications for three programs: Federal Skilled Worker, Federal Skilled Trades, and Canadian Experience Class',
                'Uses Comprehensive Ranking System (CRS) to score candidates',
                'Regular invitation rounds held throughout the year',
                'Processing time typically 6 months after invitation',
                'Provincial nominations provide additional CRS points'
            ],
            requirements: 'Language test results (IELTS or CELPIP for English, TEF for French), Educational Credential Assessment, work experience documentation, proof of funds',
            sources: [
                {
                    type: 'official' as const,
                    title: 'Express Entry Overview',
                    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html',
                    citation: 'IRPA s. 10.3'
                }
            ]
        },
        'Provincial Nominee Program (PNP)': {
            overview: 'Provincial Nominee Programs allow Canadian provinces and territories to nominate individuals for permanent residence',
            keyPoints: [
                'Each province has unique streams targeting specific skills or demographics',
                'Can be aligned with Express Entry (enhanced nomination) or paper-based',
                'Enhanced nominations provide 600 additional CRS points',
                'Common streams include skilled workers, international graduates, and entrepreneurs',
                'Processing times vary by province and stream'
            ],
            requirements: 'Requirements vary by province but generally include connection to province, work experience, language proficiency, and education credentials',
            sources: [
                {
                    type: 'official' as const,
                    title: 'Provincial Nominee Program',
                    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/provincial-nominees.html',
                    citation: 'IRPR s. 87'
                }
            ]
        },
        'Permanent Residence': {
            overview: 'Permanent residence allows you to live, work, and study anywhere in Canada',
            keyPoints: [
                'Multiple pathways: Express Entry, PNP, family sponsorship, refugee/asylum',
                'PR card valid for 5 years, renewable',
                'Must meet residency obligation: 730 days in Canada within 5-year period',
                'Can apply for citizenship after 3 years as PR',
                'Access to most social benefits (some exceptions like voting)'
            ],
            requirements: 'Pathway-specific requirements, medical examination, police certificates, proof of funds (if applicable)',
            sources: [
                {
                    type: 'official' as const,
                    title: 'Permanent Residence',
                    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/new-immigrants/pr-card.html',
                    citation: 'IRPA s. 27-28'
                }
            ]
        }
    }
};

interface ImmigrationRequest {
    jurisdiction?: 'US' | 'Canada' | 'Both';
    category: string;
    question: string;
    context?: string;
    userId: string;
}

export async function POST(request: NextRequest) {
    try {
        // Auth is optional so the assistant works without login; in production you can enforce Bearer token.
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
                    return NextResponse.json(
                        { error: 'Unauthorized - Invalid token' },
                        { status: 401 }
                    );
                }
            }
        }

        // Parse request body
        const body: ImmigrationRequest = await request.json();
        const { jurisdiction: rawJurisdiction, category, question, context, userId } = body;
        const jurisdiction = rawJurisdiction || 'Both';

        // Validate request
        if (!category || !question || !userId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // if (userId !== decodedToken.uid) {
        //   return NextResponse.json(
        //     { error: 'User ID mismatch' },
        //     { status: 403 }
        //   );
        // }

        // Check usage quota
        const today = new Date().toISOString().split('T')[0];

        // Mock DB access for now if needed, or handle potentially missing collections
        // const usageDoc = await db...

        // Get knowledge from database
        const knowledgeBase = jurisdiction === 'Both'
            ? { ...IMMIGRATION_KNOWLEDGE_BASE.US, ...IMMIGRATION_KNOWLEDGE_BASE.Canada }
            : IMMIGRATION_KNOWLEDGE_BASE[jurisdiction as 'US' | 'Canada'];

        // @ts-ignore
        const categoryInfo = knowledgeBase[category];

        // Fallback for categories not in the knowledge base (e.g. "Both" or new categories)
        const effectiveCategoryInfo = categoryInfo || {
            overview: `General guidance for ${category} in ${jurisdiction} immigration.`,
            keyPoints: [
                'Immigration rules vary by country and category; official government sources are authoritative.',
                'Consider consulting a licensed immigration attorney for case-specific advice.',
                'Keep documents and deadlines organized; policy changes can affect requirements.'
            ],
            requirements: 'Check official government websites (e.g. USCIS, IRCC) and current application guides for exact requirements.',
            sources: [
                { type: 'official' as const, title: 'USCIS', url: 'https://www.uscis.gov', citation: '' },
                { type: 'official' as const, title: 'IRCC', url: 'https://www.canada.ca/en/immigration-refugees-citizenship.html', citation: '' }
            ]
        };

        // Generate comprehensive answer
        const answer = await generateImmigrationAnswer(
            jurisdiction,
            category,
            question,
            context,
            effectiveCategoryInfo
        );

        /* 
        // Save query to database (Commented out for now to prevent crashes with mock db)
        const queryRef = await db.collection('immigrationQueries').add({
          userId,
          jurisdiction,
          category,
          question,
          context: context || '',
          answer,
          timestamp: Timestamp.now(),
          meta: {
            ip: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
          }
        });
        */

        /*
        // Update usage counter
        await db
          .collection('usage')
          .doc(userId)
          .collection('daily')
          .doc(today)
          .set(
            {
              immigrationQueries: currentUsage + 1,
              lastQuery: Timestamp.now()
            },
            { merge: true }
          );
          */

        // Generate related topics
        const relatedTopics = generateRelatedTopics(jurisdiction, category);

        const response = {
            answer,
            jurisdiction,
            category,
            sources: effectiveCategoryInfo.sources,
            relatedTopics,
            disclaimer: 'This information is for general guidance only and does not constitute legal advice. Immigration laws are complex and subject to change. For specific legal advice regarding your situation, please consult with a licensed immigration attorney.'
        };

        return NextResponse.json(response);
    } catch (error: any) {
        console.error('Immigration API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error', type: 'server' },
            { status: 500 }
        );
    }
}

async function generateImmigrationAnswer(
    jurisdiction: string,
    category: string,
    question: string,
    context: string | undefined,
    categoryInfo: any
): Promise<string> {
    // In production, this would call OpenAI API with the immigration knowledge base
    // For now, we'll generate a structured response based on the knowledge base

    let answer = `<h3>${category} - ${jurisdiction}</h3>\n\n`;

    answer += `<p><strong>Overview:</strong> ${categoryInfo.overview}</p>\n\n`;

    answer += `<p><strong>Key Points:</strong></p>\n<ul>\n`;
    categoryInfo.keyPoints.forEach((point: string) => {
        answer += `<li>${point}</li>\n`;
    });
    answer += `</ul>\n\n`;

    answer += `<p><strong>Requirements:</strong> ${categoryInfo.requirements}</p>\n\n`;

    if (context) {
        answer += `<p><strong>Regarding your specific situation:</strong> ${context}</p>\n\n`;
    }

    answer += `<p><strong>Specific to your question "${question}":</strong></p>\n`;
    answer += `<p>Based on current ${jurisdiction} immigration law, `;

    // Add context-specific guidance
    if (question.toLowerCase().includes('how long')) {
        answer += 'processing times vary depending on the specific visa category and current USCIS/IRCC workload. Typically, you should expect anywhere from a few weeks to several months. Check the official government website for current processing times.';
    } else if (question.toLowerCase().includes('cost') || question.toLowerCase().includes('fee')) {
        answer += 'there are various fees associated with immigration applications including filing fees, biometric fees, and potentially legal fees if you hire an attorney. Fees vary by application type and are subject to change.';
    } else if (question.toLowerCase().includes('work')) {
        answer += 'work authorization requirements depend on your immigration status. Some visa categories include work authorization, while others require separate applications for employment authorization documents (EAD).';
    } else {
        answer += 'please refer to the official government resources and consider consulting with an immigration attorney for personalized advice based on your specific circumstances.';
    }

    answer += '</p>\n\n';
    answer += `<p><strong>Next Steps:</strong></p>\n<ul>\n`;
    answer += `<li>Review the official government website for detailed requirements</li>\n`;
    answer += `<li>Gather all necessary documentation</li>\n`;
    answer += `<li>Consider consulting with a licensed immigration attorney</li>\n`;
    answer += `<li>Stay updated on policy changes that may affect your case</li>\n`;
    answer += `</ul>`;

    return answer;
}

function generateRelatedTopics(jurisdiction: string, category: string): string[] {
    const topics: Record<string, string[]> = {
        'Visa Types (H-1B, F-1, etc.)': [
            'How to extend my H-1B visa?',
            'Can I change from F-1 to H-1B?',
            'What is the H-1B lottery process?'
        ],
        'Express Entry System': [
            'How to improve my CRS score?',
            'What is the minimum CRS score required?',
            'Can I apply without a job offer?'
        ],
        'Green Card/Permanent Residence': [
            'How long does green card processing take?',
            'Can I travel while my green card is pending?',
            'What is the difference between conditional and unconditional green card?'
        ],
        'Provincial Nominee Program (PNP)': [
            'Which province is easiest to get nominated?',
            'Can I change provinces after nomination?',
            'What is the difference between base and enhanced PNP?'
        ]
    };

    // @ts-ignore
    return topics[category] || [
        'What documents do I need?',
        'How long is the process?',
        'Can I work while my application is pending?'
    ];
}

