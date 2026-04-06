export const LEGAL_KNOWLEDGE_BASE = {
    immigration: {
        title: 'Immigration Law Assistant',
        disclaimer: 'This assistant provides general legal information, not legal advice. Immigration outcomes depend on jurisdiction, facts, deadlines, and official policy changes. Consult a licensed immigration lawyer for case-specific advice.',
        categories: [
            'Visa Types and Status Changes',
            'Work Permits and Employment Authorization',
            'Permanent Residence and Green Cards',
            'Citizenship and Naturalization',
            'Asylum, Refugee, and Hearing Preparation',
            'Travel, Inadmissibility, and Appeals',
        ],
        documents: [
            {
                id: 'immigration-1',
                category: 'Visa Types and Status Changes',
                title: 'US temporary visa pathways',
                content: 'Temporary US immigration pathways often differ by purpose, sponsor, and timing. Common categories include H-1B specialty occupation visas, F-1 student status, L-1 intracompany transfer visas, O-1 extraordinary ability visas, and TN status for qualifying Canadian and Mexican professionals. Status maintenance, timely extensions, and work authorization boundaries are recurring risk areas.',
                sources: [
                    { type: 'official', title: 'USCIS Nonimmigrant Workers', url: 'https://www.uscis.gov/working-in-the-united-states/temporary-nonimmigrant-workers', citation: 'USCIS guidance' },
                ],
            },
            {
                id: 'immigration-2',
                category: 'Work Permits and Employment Authorization',
                title: 'Employment authorization basics',
                content: 'Work authorization depends on the underlying status or a separately approved employment authorization document. Users often need help distinguishing whether their status itself authorizes work, whether an employer-specific petition is required, and what risks apply if work begins before approval or after a status lapse.',
                sources: [
                    { type: 'official', title: 'USCIS Employment Authorization', url: 'https://www.uscis.gov/working-in-the-united-states', citation: 'USCIS guidance' },
                    { type: 'official', title: 'IRCC Work in Canada', url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada.html', citation: 'IRCC guidance' },
                ],
            },
            {
                id: 'immigration-3',
                category: 'Permanent Residence and Green Cards',
                title: 'Permanent residence pathways',
                content: 'Permanent residence questions usually turn on eligibility pathway, documentary support, admissibility, and wait times. In the US, family and employment-based categories are common. In Canada, Express Entry, provincial nomination, and sponsorship pathways are frequent. Strategy often includes understanding current status, travel constraints, sponsorship timing, and maintaining lawful presence while applications are pending.',
                sources: [
                    { type: 'official', title: 'USCIS Green Card', url: 'https://www.uscis.gov/green-card', citation: 'USCIS guidance' },
                    { type: 'official', title: 'IRCC Permanent Residence', url: 'https://www.canada.ca/en/services/immigration-citizenship.html', citation: 'IRCC guidance' },
                ],
            },
            {
                id: 'immigration-4',
                category: 'Citizenship and Naturalization',
                title: 'Citizenship preparation topics',
                content: 'Citizenship and naturalization preparation often focuses on residence rules, physical presence, language and civics requirements, criminal history, and travel outside the country. Applicants benefit from organizing address history, travel logs, tax compliance information, and evidence of continued eligibility before filing.',
                sources: [
                    { type: 'official', title: 'USCIS Citizenship and Naturalization', url: 'https://www.uscis.gov/citizenship', citation: 'USCIS guidance' },
                    { type: 'official', title: 'IRCC Citizenship', url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship.html', citation: 'IRCC guidance' },
                ],
            },
            {
                id: 'immigration-5',
                category: 'Asylum, Refugee, and Hearing Preparation',
                title: 'Hearing and protection claim preparation',
                content: 'Protection-based matters usually require timeline clarity, supporting documentation, consistency, and preparation for interviews or hearings. Users often need help identifying what evidence to organize, how to structure a chronology, and what issues may affect credibility, admissibility, or discretionary relief.',
                sources: [
                    { type: 'official', title: 'USCIS Asylum', url: 'https://www.uscis.gov/humanitarian/refugees-and-asylum/asylum', citation: 'USCIS guidance' },
                    { type: 'official', title: 'IRB Refugee Claims', url: 'https://irb.gc.ca/', citation: 'Immigration and Refugee Board guidance' },
                ],
            },
        ],
    },
    family: {
        title: 'Family Law Assistant',
        disclaimer: 'This assistant provides general family-law information and preparation guidance, not legal advice. Family-law outcomes depend heavily on local law and the facts of the case. Consult a licensed family-law attorney in your jurisdiction.',
        categories: [
            'Custody and Parenting Plans',
            'Divorce and Separation Preparation',
            'Child and Spousal Support',
            'Protective Orders and Safety Planning',
            'Mediation and Family Court Checklists',
        ],
        documents: [
            {
                id: 'family-1',
                category: 'Custody and Parenting Plans',
                title: 'Custody and parenting plan preparation',
                content: 'Custody planning usually centers on the child best-interest standard, parenting schedules, communication logistics, school and medical decision-making, and documentation of current caregiving patterns. Helpful preparation often includes calendars, proposed schedules, child needs summaries, and evidence relevant to stability or safety concerns.',
                sources: [
                    { type: 'legal', title: 'State family court standards', citation: 'Best-interest analysis varies by state or province' },
                ],
            },
            {
                id: 'family-2',
                category: 'Divorce and Separation Preparation',
                title: 'Separation and divorce organization',
                content: 'Divorce and separation preparation often includes a timeline of the relationship, income and expense records, debts, property lists, and communication history. Users benefit from organizing financial disclosures early and separating immediate safety or custody concerns from long-term property and support issues.',
                sources: [
                    { type: 'legal', title: 'Local domestic relations rules', citation: 'Jurisdiction-specific procedure applies' },
                ],
            },
            {
                id: 'family-3',
                category: 'Child and Spousal Support',
                title: 'Support calculation themes',
                content: 'Support questions often turn on income, parenting time, extraordinary expenses, imputed income, and local guidelines. People preparing for hearings should gather pay records, tax returns, childcare and medical expenses, and any evidence of changed circumstances if they seek modification.',
                sources: [
                    { type: 'legal', title: 'Support guideline frameworks', citation: 'Jurisdiction-specific support formulas' },
                ],
            },
            {
                id: 'family-4',
                category: 'Protective Orders and Safety Planning',
                title: 'Safety-first preparation',
                content: 'Protective-order matters can be urgent and fact-sensitive. Preparation often includes a clear incident chronology, preserved messages, photos, witness information, and an immediate plan for safety, housing, and child exchanges. Users should be encouraged to seek emergency local assistance where needed.',
                sources: [
                    { type: 'official', title: 'Local court protective-order resources', citation: 'Emergency procedures vary by jurisdiction' },
                ],
            },
        ],
    },
    business: {
        title: 'Business Law Assistant',
        disclaimer: 'This assistant provides general business-law information, not legal advice. Entity, tax, and regulatory decisions can have major consequences. Consult licensed counsel and tax professionals for advice tailored to your business and jurisdiction.',
        categories: [
            'Entity Formation and Structure',
            'Corporate Governance and Compliance',
            'Commercial Contracts and Vendor Terms',
            'IP, Licensing, and Brand Protection',
            'Employment, Risk, and Regulatory Issues',
        ],
        documents: [
            {
                id: 'business-1',
                category: 'Entity Formation and Structure',
                title: 'Choosing a business entity',
                content: 'Entity selection usually balances liability protection, tax treatment, governance flexibility, fundraising plans, and administrative burden. LLCs, corporations, and partnerships each create different obligations for ownership, filings, and management. Users should separate legal formation questions from tax-election questions when planning.',
                sources: [
                    { type: 'official', title: 'IRS Business Structures', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/business-structures', citation: 'IRS guidance' },
                ],
            },
            {
                id: 'business-2',
                category: 'Corporate Governance and Compliance',
                title: 'Governance fundamentals',
                content: 'Governance work often includes operating agreements or bylaws, recordkeeping, annual filings, signatures, board or manager authority, and conflict handling. A recurring issue is whether the company followed its own internal approval rules before signing agreements or making ownership decisions.',
                sources: [
                    { type: 'legal', title: 'State entity statutes', citation: 'Entity governance rules vary by state or province' },
                ],
            },
            {
                id: 'business-3',
                category: 'Commercial Contracts and Vendor Terms',
                title: 'Commercial deal review',
                content: 'Commercial contracts often require careful review of scope, payment triggers, indemnity, limitation of liability, termination rights, data use, confidentiality, and dispute resolution. Users often need help identifying which terms are operational risks versus negotiable business positions.',
                sources: [
                    { type: 'legal', title: 'General contract principles', citation: 'Commercial law and contract law intersect' },
                ],
            },
            {
                id: 'business-4',
                category: 'IP, Licensing, and Brand Protection',
                title: 'Brand and IP readiness',
                content: 'IP planning commonly involves brand clearance, trademark filing strategy, contractor IP assignment, confidentiality controls, and license scope. Businesses often miss ownership details when contractors or agencies create content, software, or brand assets without clear assignment language.',
                sources: [
                    { type: 'official', title: 'USPTO Trademarks', url: 'https://www.uspto.gov/trademarks', citation: 'USPTO guidance' },
                ],
            },
        ],
    },
    contracts: {
        title: 'Contract Law Assistant',
        disclaimer: 'This assistant provides general contract information and review preparation guidance, not legal advice. Contract enforceability and remedies depend on wording, facts, and jurisdiction. Consult a licensed attorney before relying on a contract interpretation.',
        categories: [
            'Contract Formation and Enforceability',
            'Risk Clauses and Indemnities',
            'Payment, Renewal, and Termination Terms',
            'Negotiation Prep and Redlines',
            'Breach, Remedies, and Dispute Clauses',
        ],
        documents: [
            {
                id: 'contracts-1',
                category: 'Contract Formation and Enforceability',
                title: 'Core formation issues',
                content: 'Contract questions often begin with whether there was a clear offer, acceptance, consideration, lawful subject matter, and sufficient certainty of terms. Written form may be especially important for certain transactions, long-term commitments, or statutory requirements. Ambiguous side communications can complicate enforceability.',
                sources: [
                    { type: 'legal', title: 'Restatement (Second) of Contracts', citation: 'General formation principles' },
                ],
            },
            {
                id: 'contracts-2',
                category: 'Risk Clauses and Indemnities',
                title: 'Risk allocation clauses',
                content: 'Risk allocation often hides in indemnity, warranty disclaimers, limitation-of-liability language, insurance requirements, and exclusions. A useful review separates direct loss exposure, third-party claim exposure, carve-outs, and whether one party has accepted unusually broad defense obligations.',
                sources: [
                    { type: 'legal', title: 'Commercial contracting practice', citation: 'Interpretation varies by jurisdiction and drafting' },
                ],
            },
            {
                id: 'contracts-3',
                category: 'Payment, Renewal, and Termination Terms',
                title: 'Operational contract risk',
                content: 'Operational disputes frequently arise from vague scope, auto-renewal terms, invoice timing, cure periods, suspension rights, and termination mechanics. Users benefit from mapping the life cycle of the deal: onboarding, performance, payment, renewal, exit, and post-termination obligations.',
                sources: [
                    { type: 'legal', title: 'Contract administration principles', citation: 'Business risk often turns on drafting precision' },
                ],
            },
            {
                id: 'contracts-4',
                category: 'Breach, Remedies, and Dispute Clauses',
                title: 'Responding to breach',
                content: 'When breach is alleged, the key issues usually include whether the breach is material, whether notice and cure were required, what damages are provable, and whether arbitration or court litigation is required. Document preservation and a clear chronology become important very early.',
                sources: [
                    { type: 'legal', title: 'Breach and remedy doctrines', citation: 'Remedies depend on contract and governing law' },
                ],
            },
        ],
    },
    consumer: {
        title: 'Consumer Law Assistant',
        disclaimer: 'This assistant provides general consumer-law information, not legal advice. Consumer rights and remedies vary by state, province, agency rules, and contract terms. Consult qualified counsel or the relevant agency for case-specific help.',
        categories: [
            'Defective Products and Warranties',
            'Debt Collection and Credit Disputes',
            'Fraud, Scams, and Chargebacks',
            'Unfair Practices and Refund Issues',
            'Complaint Letters and Agency Escalation',
        ],
        documents: [
            {
                id: 'consumer-1',
                category: 'Defective Products and Warranties',
                title: 'Warranty and defect disputes',
                content: 'Warranty problems usually require product details, proof of purchase, warranty language, defect history, and a record of repair attempts or merchant communications. People often need help deciding whether the issue sounds like an express warranty claim, implied warranty issue, lemon-law issue, or chargeback dispute.',
                sources: [
                    { type: 'official', title: 'FTC Warranty Guidance', url: 'https://www.ftc.gov/business-guidance/resources/businesspersons-guide-federal-warranty-law', citation: 'FTC guidance' },
                ],
            },
            {
                id: 'consumer-2',
                category: 'Debt Collection and Credit Disputes',
                title: 'Collections and reporting prep',
                content: 'Debt collection and credit-reporting matters often turn on dates, validation notices, call records, dispute letters, and whether the consumer can identify inaccuracies or prohibited conduct. Organizing a clean communication log is often the most practical first step.',
                sources: [
                    { type: 'official', title: 'CFPB Debt Collection', url: 'https://www.consumerfinance.gov/consumer-tools/debt-collection/', citation: 'CFPB guidance' },
                    { type: 'official', title: 'CFPB Credit Reports', url: 'https://www.consumerfinance.gov/consumer-tools/credit-reports-and-scores/', citation: 'CFPB guidance' },
                ],
            },
            {
                id: 'consumer-3',
                category: 'Fraud, Scams, and Chargebacks',
                title: 'Fraud response checklist',
                content: 'Fraud response usually involves documenting the transaction, preserving messages or screenshots, contacting the bank or card issuer quickly, freezing accounts if needed, and reporting to the relevant authorities. The strongest preparation includes a tight chronology of who said what, when, and what money or data changed hands.',
                sources: [
                    { type: 'official', title: 'FTC Report Fraud', url: 'https://reportfraud.ftc.gov', citation: 'FTC reporting portal' },
                ],
            },
            {
                id: 'consumer-4',
                category: 'Complaint Letters and Agency Escalation',
                title: 'Escalation strategy',
                content: 'Good escalation prep focuses on the remedy requested, supporting documents, timeline, merchant responses, and whether an agency, ombuds office, attorney general, regulator, or small-claims court is the right next step. Clear written demand letters often improve outcomes even before formal escalation.',
                sources: [
                    { type: 'official', title: 'Consumer FTC resources', url: 'https://consumer.ftc.gov', citation: 'FTC consumer resources' },
                ],
            },
        ],
    },
    employment: {
        title: 'Employment Law Assistant',
        disclaimer: 'This assistant provides general workplace-rights information, not legal advice. Employment law varies by jurisdiction, employer size, contract terms, and the facts of the dispute. Consult an employment lawyer or agency for case-specific advice.',
        categories: [
            'Wages, Overtime, and Misclassification',
            'Termination, Severance, and Retaliation',
            'Discrimination and Harassment Documentation',
            'Leave, Accommodation, and Disability Issues',
            'Workplace Policies and Complaint Prep',
        ],
        documents: [
            {
                id: 'employment-1',
                category: 'Wages, Overtime, and Misclassification',
                title: 'Pay and classification issues',
                content: 'Wage claims often depend on time records, pay stubs, job duties, exemption status, and whether the worker was treated as an employee or contractor. Users benefit from separating scheduling facts, control over the work, unpaid time, and reimbursement issues when organizing a claim.',
                sources: [
                    { type: 'official', title: 'US DOL Wage and Hour', url: 'https://www.dol.gov/agencies/whd', citation: 'DOL guidance' },
                ],
            },
            {
                id: 'employment-2',
                category: 'Termination, Severance, and Retaliation',
                title: 'Exit and retaliation preparation',
                content: 'Termination and retaliation matters usually require a timeline of complaints, performance reviews, warnings, protected activity, and the employer response. People often need help identifying what documents to preserve and what issues should be raised with HR, an agency, or counsel first.',
                sources: [
                    { type: 'official', title: 'EEOC Retaliation', url: 'https://www.eeoc.gov/retaliation', citation: 'EEOC guidance' },
                ],
            },
            {
                id: 'employment-3',
                category: 'Discrimination and Harassment Documentation',
                title: 'Documenting workplace conduct',
                content: 'For discrimination or harassment issues, organized notes, witnesses, messages, policy acknowledgments, and prior internal complaints can matter. Users benefit from building a neutral fact timeline and separating direct evidence, comparators, policy violations, and emotional or medical impacts.',
                sources: [
                    { type: 'official', title: 'EEOC Discrimination', url: 'https://www.eeoc.gov/discrimination-type', citation: 'EEOC guidance' },
                ],
            },
            {
                id: 'employment-4',
                category: 'Leave, Accommodation, and Disability Issues',
                title: 'Accommodation and leave prep',
                content: 'Accommodation and leave questions usually focus on essential job functions, medical documentation, interactive process steps, scheduling impacts, and employer communications. Users often need help understanding how to prepare a clear written request and what follow-up records to keep.',
                sources: [
                    { type: 'official', title: 'EEOC Disability Guidance', url: 'https://www.eeoc.gov/laws/guidance/enforcement-guidance-reasonable-accommodation-and-undue-hardship-under-ada', citation: 'EEOC guidance' },
                ],
            },
        ],
    },
    litigation: {
        title: 'Civil Litigation Assistant',
        disclaimer: 'This assistant provides general dispute-preparation information, not legal advice. Filing deadlines, evidence rules, and litigation strategy depend on jurisdiction and facts. Consult licensed counsel before taking legal action.',
        categories: [
            'Demand Letters and Pre-Suit Strategy',
            'Evidence and Timeline Organization',
            'Mediation and Settlement Preparation',
            'Small Claims and Civil Procedure Basics',
            'Case Handoff Notes for Counsel',
        ],
        documents: [
            {
                id: 'litigation-1',
                category: 'Demand Letters and Pre-Suit Strategy',
                title: 'Pre-suit positioning',
                content: 'Before filing, parties often need a clear theory of the dispute, available damages, contract terms or legal duties involved, and a realistic goal for settlement. A useful demand package includes the timeline, supporting exhibits, specific requested remedy, and a response deadline.',
                sources: [
                    { type: 'legal', title: 'General civil pre-suit practice', citation: 'Procedure varies by claim and jurisdiction' },
                ],
            },
            {
                id: 'litigation-2',
                category: 'Evidence and Timeline Organization',
                title: 'Evidence first approach',
                content: 'Litigation preparation improves dramatically when documents are organized chronologically and tied to issues. Messages, invoices, contracts, photos, records of calls, and witness names should be indexed so a lawyer or decision maker can understand the dispute quickly.',
                sources: [
                    { type: 'legal', title: 'Evidence organization principles', citation: 'Preservation and chronology matter early' },
                ],
            },
            {
                id: 'litigation-3',
                category: 'Mediation and Settlement Preparation',
                title: 'Settlement readiness',
                content: 'Good mediation prep means understanding leverage, best and worst realistic outcomes, missing evidence, cost of continued litigation, and non-monetary terms that matter. Users benefit from drafting a concise case summary and clarifying decision points before the session.',
                sources: [
                    { type: 'legal', title: 'ADR and mediation practice', citation: 'Mediation frameworks vary' },
                ],
            },
            {
                id: 'litigation-4',
                category: 'Small Claims and Civil Procedure Basics',
                title: 'Forum and procedure basics',
                content: 'Procedure questions often concern where to file, service rules, deadlines, small-claims limits, and what exhibits to bring. While the assistant should not provide filing strategy as legal advice, it can help users create checklists and organize facts before consulting local court resources or counsel.',
                sources: [
                    { type: 'official', title: 'Local court self-help resources', citation: 'Court procedures vary by jurisdiction' },
                ],
            },
        ],
    },
    criminal: {
        title: 'Criminal Law Research Assistant',
        disclaimer: 'This assistant provides general legal information and research support, not legal advice. Criminal cases are high-stakes and fact-specific. Anyone facing charges should seek a qualified defense lawyer immediately.',
        categories: [
            'Offense Comparisons',
            'Search and Seizure',
            'Bail and Pretrial Detention',
            'Defenses and Sentencing',
            'Research and Comparative Analysis',
        ],
        documents: [
            {
                id: 'criminal-1',
                category: 'Offense Comparisons',
                title: 'Comparative criminal-law orientation',
                content: 'This product’s criminal-law experience is comparative and research-oriented, focused mainly on Canada and the United States. Helpful outputs usually identify the offense framework, major elements, common defenses, sentencing exposure, and where federal versus state or provincial differences matter most.',
                sources: [
                    { type: 'legal', title: 'Comparative criminal law research', citation: 'Canada and US frameworks' },
                ],
            },
            {
                id: 'criminal-2',
                category: 'Search and Seizure',
                title: 'Search and seizure themes',
                content: 'Search-and-seizure questions often hinge on warrants, exceptions, consent, detention scope, privacy expectations, and exclusion of evidence. In comparative analysis, the key difference is often the legal test and remedy rather than the broad right itself.',
                sources: [
                    { type: 'legal', title: 'Canadian Charter s. 8 and US Fourth Amendment', citation: 'Comparative rights framework' },
                ],
            },
            {
                id: 'criminal-3',
                category: 'Bail and Pretrial Detention',
                title: 'Pretrial release research',
                content: 'Bail questions usually turn on release presumptions, public-safety concerns, court-attendance risk, and local statutory frameworks. Comparative research helps users see where ladder principles, cash-bail systems, or detention standards differ.',
                sources: [
                    { type: 'legal', title: 'Canadian and US bail frameworks', citation: 'Comparative criminal procedure' },
                ],
            },
            {
                id: 'criminal-4',
                category: 'Defenses and Sentencing',
                title: 'Defense and sentencing research',
                content: 'Self-defense, duress, necessity, and sentencing questions are heavily jurisdiction-dependent. Good research responses identify the legal test, important factors, and what information a lawyer would need to assess the issue more precisely.',
                sources: [
                    { type: 'legal', title: 'Criminal defenses and sentencing principles', citation: 'Jurisdiction-specific' },
                ],
            },
        ],
    },
};

export function getLegalAssistantKnowledge(assistantId) {
    return LEGAL_KNOWLEDGE_BASE[assistantId];
}
