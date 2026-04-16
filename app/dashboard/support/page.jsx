'use client';

import React from 'react';
import { Mail, MessageCircle, Phone } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';

const faqCategoriesEn = [
    {
        category: 'General Questions',
        faqs: [
            {
                question: 'What is Kimuntu AI?',
                answer: 'Kimuntu AI is a next-generation AI ecosystem by Kimuntu Power Inc. It helps launch users toward success in career, business, legal navigation, and innovation goals using advanced AI tools, simulations, and intelligent avatars.'
            },
            {
                question: 'Who is Kimuntu AI designed for?',
                answer: 'Job seekers, professionals, entrepreneurs, startups, SMEs, students, newcomers, legal self-help users in Canada and the USA, and governments, NGOs, and educational institutions.'
            },
            {
                question: 'What makes Kimuntu AI unique?',
                answer: 'Unlike single-purpose platforms, Kimuntu AI integrates four intelligence tracks: (1) Personal/Career, (2) Business, (3) Legal for Canada and USA, and (4) Future Intelligence and Innovation — all in one unified ecosystem.'
            },
            {
                question: 'Is the platform secure and compliant?',
                answer: 'Yes. Kimuntu AI follows GDPR, CCPA, and PIPEDA. All data is AES-256 encrypted in transit and at rest, anonymized where applicable, and fully user-controlled. We never sell personal data.'
            },
            {
                question: 'What languages are supported?',
                answer: 'English, French, and Spanish are fully supported. The AI Multilingual Translation and Voice Assistant covers 50+ languages for document translation and real-time communication.'
            },
        ]
    },
    {
        category: 'Personal & Career Track',
        faqs: [
            {
                question: 'What does the AI CV Builder do?',
                answer: 'It generates professional, ATS-optimized resumes and cover letters tailored to specific industries and roles, with multi-language support and real-time improvements.'
            },
            {
                question: 'How does the AI Interview Coach work?',
                answer: 'It simulates realistic job interviews using AI avatars, analyzes tone and communication style, and delivers detailed performance reports with actionable feedback. Users can retry sessions to track progress.'
            },
            {
                question: 'What is the AI Career Accelerator?',
                answer: 'A complete career growth engine that evaluates skills via adaptive AI assessments, identifies gaps, recommends targeted courses (Coursera, Udemy, LinkedIn Learning), builds personalized development roadmaps, and tracks progress in real time.'
            },
            {
                question: 'What is the LevelUp Skills Hub?',
                answer: 'The integrated upskilling engine offering personalized learning pathways, gamified micro-learning experiences, digital badges, and certifications — connected to major global education platforms.'
            },
        ]
    },
    {
        category: 'Business Intelligence Track',
        faqs: [
            {
                question: 'What types of business plans are available?',
                answer: 'Three levels: Basic (executive summary, market overview), Medium (competitor analysis, financial projections), and Professional (strategic marketing, investor-ready financial models, AI website builder, and SEO integration).'
            },
            {
                question: 'What is Kimuntu TeamAI?',
                answer: 'A virtual enterprise automation suite that simulates a full company — CEO, HR, Finance, Sales, and Administration AI agents. It allows a solo founder to operate like a 20-person team, with AI cold calling, automated emails, CRM integration, and daily executive reports.'
            },
            {
                question: 'How does the Funding Finder work?',
                answer: 'The AI scans global funding databases, grant programs, and VC directories, matching businesses with the most relevant opportunities. It can also auto-generate pitch decks and investor presentations.'
            },
            {
                question: 'Is a website builder included?',
                answer: 'Yes. The AI Website Builder offers drag-and-drop templates, domain integration, cloud hosting, e-commerce, and AI-driven SEO optimization.'
            },
        ]
    },
    {
        category: 'Legal Intelligence Track',
        faqs: [
            {
                question: 'What legal areas are covered in Canada?',
                answer: 'Family Law, Criminal Law, Business and Contract Law, Consumer Rights, Immigration and Refugee Law, Labor Law, and Civil Litigation — with AI document drafting, case analysis, and success probability estimation.'
            },
            {
                question: 'What legal areas are covered in the USA?',
                answer: 'The same comprehensive coverage: Family Law, Criminal Law research, Business Contracts, Consumer Rights, Immigration and Visa guidance, Workplace Rights, and Civil Litigation prediction and mediation tools.'
            },
            {
                question: 'Does Kimuntu AI replace a lawyer?',
                answer: 'No. Kimuntu AI provides AI-assisted guidance and document drafting for informational and preparation purposes only. It is not a law firm. For formal legal proceedings, users are directed to licensed attorneys in their jurisdiction.'
            },
            {
                question: 'What are Virtual Lawyer Avatars and Court Simulations?',
                answer: 'Virtual Lawyer Avatars are interactive AI agents that simulate legal consultations. The Immigration Court Simulation uses AI judges, lawyers, and officers to help users prepare for asylum hearings or immigration proceedings.'
            },
        ]
    },
    {
        category: 'Future Intelligence & Innovation Track',
        faqs: [
            {
                question: 'What is the Future Intelligence Track?',
                answer: 'A forward-looking suite of AI tools for innovation, sustainability, and human advancement — covering sustainable business planning, patent research, personalized education, smart city simulation, and ethical AI governance.'
            },
            {
                question: 'What is the Sustainable Innovation Assistant?',
                answer: 'AI tools for carbon footprint analysis, ESG strategy generation, supply chain sustainability, and funding identification for green projects and climate-focused startups.'
            },
            {
                question: 'Who benefits from the Innovation Track?',
                answer: 'Governments, NGOs, researchers, innovators, educators, and entrepreneurs building sustainable, future-ready solutions.'
            },
        ]
    },
    {
        category: 'Pricing & Support',
        faqs: [
            {
                question: 'What pricing tiers are available?',
                answer: 'Free Tier (basic tools), Career Premium ($10–15/month), Business Premium ($20–50/month), Legal Premium ($30–100/month), and Enterprise/Institutional licensing with custom pricing.'
            },
            {
                question: 'Is mobile access available?',
                answer: 'Yes — web browser, Android, and iOS, with full cloud synchronization across all devices.'
            },
            {
                question: 'How do I contact support?',
                answer: 'Via the in-platform Support page, email at support@kimuntu.ai, or the Help Center with guides, video tutorials, and an AI onboarding assistant.'
            },
        ]
    },
];

const faqCategoriesFr = [
    {
        category: 'Questions générales',
        faqs: [
            { question: 'Qu’est-ce que Kimuntu AI ?', answer: 'Kimuntu AI est un écosystème IA de nouvelle génération créé par Kimuntu Power Inc. Il aide les utilisateurs à progresser vers la réussite en carrière, affaires, navigation juridique et innovation grâce à des outils IA avancés, des simulations et des avatars intelligents.' },
            { question: 'À qui s’adresse Kimuntu AI ?', answer: 'Aux chercheurs d’emploi, professionnels, entrepreneurs, startups, PME, étudiants, nouveaux arrivants, utilisateurs de soutien juridique autonome au Canada et aux États-Unis, ainsi qu’aux gouvernements, ONG et établissements d’enseignement.' },
            { question: 'Qu’est-ce qui rend Kimuntu AI unique ?', answer: 'Contrairement aux plateformes à usage unique, Kimuntu AI réunit quatre pistes d’intelligence : (1) Personnel/Carrière, (2) Affaires, (3) Juridique pour le Canada et les États-Unis, et (4) Intelligence future et innovation, le tout dans un même écosystème.' },
            { question: 'La plateforme est-elle sécurisée et conforme ?', answer: 'Oui. Kimuntu AI respecte le RGPD, le CCPA et la PIPEDA. Toutes les données sont chiffrées AES-256 en transit et au repos, anonymisées lorsque cela s’applique et entièrement contrôlées par l’utilisateur. Nous ne vendons jamais de données personnelles.' },
            { question: 'Quelles langues sont prises en charge ?', answer: 'L’anglais, le français et l’espagnol sont pleinement pris en charge. L’assistant multilingue de traduction et de voix IA couvre plus de 50 langues pour la traduction de documents et la communication en temps réel.' },
        ]
    },
    {
        category: 'Piste personnelle et carrière',
        faqs: [
            { question: 'Que fait le générateur de CV IA ?', answer: 'Il génère des CV professionnels optimisés ATS et des lettres de motivation adaptés à des secteurs et rôles précis, avec prise en charge multilingue et améliorations en temps réel.' },
            { question: 'Comment fonctionne le coach d’entretien IA ?', answer: 'Il simule des entretiens réalistes avec des avatars IA, analyse le ton et le style de communication, puis fournit des rapports détaillés avec des commentaires exploitables. Les utilisateurs peuvent refaire des sessions pour suivre leurs progrès.' },
            { question: 'Qu’est-ce que l’AI Career Accelerator ?', answer: 'C’est un moteur complet de progression de carrière qui évalue les compétences via des évaluations IA adaptatives, identifie les lacunes, recommande des cours ciblés, construit des feuilles de route personnalisées et suit les progrès en temps réel.' },
            { question: 'Qu’est-ce que le LevelUp Skills Hub ?', answer: 'Le moteur de montée en compétences intégré offrant des parcours d’apprentissage personnalisés, des expériences de micro-apprentissage gamifiées, des badges numériques et des certifications connectés aux grandes plateformes éducatives mondiales.' },
        ]
    },
    {
        category: 'Piste d’intelligence d’affaires',
        faqs: [
            { question: 'Quels types de plans d’affaires sont disponibles ?', answer: 'Trois niveaux : Basique, Intermédiaire et Professionnel, incluant selon le niveau un résumé exécutif, une vue du marché, une analyse des concurrents, des projections financières, un constructeur de site Web IA et une intégration SEO.' },
            { question: 'Qu’est-ce que Kimuntu TeamAI ?', answer: 'Une suite d’automatisation d’entreprise virtuelle qui simule une entreprise complète avec des agents IA CEO, RH, Finance, Ventes et Administration. Elle permet à un fondateur solo d’opérer comme une équipe de 20 personnes.' },
            { question: 'Comment fonctionne Funding Finder ?', answer: 'L’IA analyse des bases de données mondiales de financement, programmes de subventions et annuaires de VC, puis associe les entreprises aux opportunités les plus pertinentes. Elle peut aussi générer automatiquement des pitch decks et présentations investisseurs.' },
            { question: 'Un constructeur de site Web est-il inclus ?', answer: 'Oui. Le constructeur de site Web IA propose des modèles glisser-déposer, l’intégration de domaines, l’hébergement cloud, le commerce électronique et l’optimisation SEO pilotée par IA.' },
        ]
    },
    {
        category: 'Piste d’intelligence juridique',
        faqs: [
            { question: 'Quels domaines juridiques sont couverts au Canada ?', answer: 'Le droit de la famille, le droit pénal, le droit des affaires et des contrats, les droits des consommateurs, l’immigration et le statut de réfugié, le droit du travail et le contentieux civil, avec rédaction de documents par IA et analyse de dossiers.' },
            { question: 'Quels domaines juridiques sont couverts aux États-Unis ?', answer: 'La même couverture complète : famille, recherche en droit pénal, contrats commerciaux, droits des consommateurs, immigration et visas, droits au travail et outils de prévision et médiation en contentieux civil.' },
            { question: 'Kimuntu AI remplace-t-il un avocat ?', answer: 'Non. Kimuntu AI fournit des conseils assistés par IA et de la rédaction de documents à des fins d’information et de préparation uniquement. Ce n’est pas un cabinet d’avocats.' },
            { question: 'Que sont les avatars d’avocats virtuels et les simulations de tribunal ?', answer: 'Les avatars d’avocats virtuels sont des agents IA interactifs qui simulent des consultations juridiques. La simulation de tribunal d’immigration aide les utilisateurs à se préparer aux audiences ou procédures d’immigration.' },
        ]
    },
    {
        category: 'Piste d’intelligence future et d’innovation',
        faqs: [
            { question: 'Qu’est-ce que la piste Future Intelligence ?', answer: 'Une suite tournée vers l’avenir d’outils IA pour l’innovation, la durabilité et l’avancement humain : planification durable, recherche de brevets, éducation personnalisée, simulation de ville intelligente et gouvernance éthique de l’IA.' },
            { question: 'Qu’est-ce que le Sustainable Innovation Assistant ?', answer: 'Des outils IA pour l’analyse d’empreinte carbone, la génération de stratégie ESG, la durabilité de la chaîne d’approvisionnement et l’identification de financements pour les projets verts et startups climat.' },
            { question: 'Qui bénéficie de la piste Innovation ?', answer: 'Les gouvernements, ONG, chercheurs, innovateurs, éducateurs et entrepreneurs qui construisent des solutions durables et prêtes pour l’avenir.' },
        ]
    },
    {
        category: 'Tarification et assistance',
        faqs: [
            { question: 'Quels niveaux de tarification sont proposés ?', answer: 'Niveau gratuit, Career Premium, Business Premium, Legal Premium, ainsi que des licences entreprise/institutionnelles avec tarification sur mesure.' },
            { question: 'L’accès mobile est-il disponible ?', answer: 'Oui, via navigateur Web, Android et iOS, avec synchronisation cloud complète sur tous les appareils.' },
            { question: 'Comment contacter le support ?', answer: 'Via la page Support intégrée, par e-mail à support@kimuntu.ai, ou via le centre d’aide avec guides, tutoriels vidéo et assistant d’onboarding IA.' },
        ]
    },
];

export default function SupportPage() {
    const { isDark } = useTheme();
    const { t, language } = useLanguage();
    const faqCategories = language === 'fr' ? faqCategoriesFr : faqCategoriesEn;
    const contactMethods = [
        { icon: Mail, title: t.support_emailTitle, description: t.support_emailDesc, response: t.support_emailResponse },
        { icon: MessageCircle, title: t.support_chatTitle, description: t.support_chatDesc, response: t.support_chatResponse },
        { icon: Phone, title: t.support_phoneTitle, description: t.support_phoneDesc, response: t.support_phoneResponse },
    ];

    return (
        <div>
            <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t.support_title}
            </h2>
            <p className={`mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t.support_subtitle}
            </p>

            {/* Contact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                {contactMethods.map((method, index) => (
                    <div
                        key={index}
                        className={`rounded-2xl p-6 text-center border ${isDark
                            ? 'bg-gray-900/80 border-gray-800'
                            : 'bg-white border-gray-200'
                        } shadow-sm`}
                    >
                        <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                            <method.icon className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        </div>
                        <h4 className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{method.title}</h4>
                        <p className={`text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{method.description}</p>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{method.response}</p>
                    </div>
                ))}
            </div>

            {/* FAQ */}
            <h3 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t.support_faqTitle}
            </h3>
            <div className="space-y-8">
                {faqCategories.map((cat, catIndex) => (
                    <div key={catIndex}>
                        <h4 className={`text-base font-bold mb-3 pb-2 border-b ${isDark ? 'text-emerald-400 border-gray-800' : 'text-emerald-700 border-gray-200'}`}>
                            {cat.category}
                        </h4>
                        <div className="space-y-3">
                            {cat.faqs.map((faq, index) => (
                                <details
                                    key={index}
                                    className={`p-5 rounded-xl border ${isDark
                                        ? 'bg-gray-900/60 border-gray-800'
                                        : 'bg-white border-gray-200'
                                    }`}
                                >
                                    <summary className={`cursor-pointer font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {faq.question}
                                    </summary>
                                    <p className={`mt-3 text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {faq.answer}
                                    </p>
                                </details>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
