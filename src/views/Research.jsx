'use client';

import React, { useState } from 'react';
import PageWrapper from '@/components/PageWrapper';
import { useTheme } from '@/components/providers/ThemeProvider';
import {
    Globe,
    Scale,
    BookOpen,
    Library,
    Gavel,
    ShieldCheck,
    Radar,
    Sparkles,
    FileText,
    Map,
    Brain,
    Shield,
    Landmark,
    Search,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    BookMarked,
    Crosshair,
    Fingerprint,
    HeartHandshake,
    Network,
} from 'lucide-react';

const Research = () => {
    const { isDark } = useTheme();
    const [expandedArea, setExpandedArea] = useState(null);
    const [activeJurisdictionTab, setActiveJurisdictionTab] = useState('canada');

    const stats = [
        { value: '2', label: 'Jurisdictions' },
        { value: '50+', label: 'Offenses Covered' },
        { value: '200+', label: 'Case Citations' },
        { value: '8', label: 'Research Areas' },
    ];

    const pillars = [
        {
            icon: Globe,
            title: 'Bi-National Scope',
            description: 'Comprehensive coverage of both Canadian federal criminal law and United States federal and state criminal codes, with structured comparative analysis across every offense category.',
        },
        {
            icon: Library,
            title: 'Primary Sources',
            description: 'Direct citations to statutes (Criminal Code R.S.C., Title 18 U.S.C.), binding case law, sentencing guidelines, and procedural rules from official reporters and legislation portals.',
        },
        {
            icon: ShieldCheck,
            title: 'Defenses + Rights',
            description: 'Full mapping of constitutional protections under the Canadian Charter of Rights and Freedoms (ss. 7-14) and the U.S. Bill of Rights (4th, 5th, 6th, 8th, 14th Amendments).',
        },
        {
            icon: Radar,
            title: 'Continuous Updates',
            description: 'Versioned research entries with change logs, review checkpoints, and freshness dates ensuring the database reflects current law including recent Supreme Court decisions.',
        },
    ];

    const offenseComparisons = [
        {
            category: 'Theft',
            canada: 'Criminal Code ss. 322-334. Theft over $5,000 (indictable, max 10 years) and theft under $5,000 (hybrid). Elements: fraudulently taking anything with intent to deprive the owner. Includes conversion, misappropriation, and taking pledged property.',
            us: 'Varies by state. Generally classified as petty theft (misdemeanor, typically under $500-$1,000) and grand theft (felony). MPC 223.2: unlawful taking of movable property with purpose to deprive. Federal: 18 U.S.C. 641 (government property theft, up to 10 years).',
        },
        {
            category: 'Assault',
            canada: 'Criminal Code ss. 265-269. Three levels: common assault (s. 266, hybrid), assault causing bodily harm (s. 267, max 10 years), and aggravated assault (s. 268, max 14 years). Consent is a defence; no separate battery offense. Application of force or threat thereof without consent.',
            us: 'Distinguished from battery in most states. Simple assault: attempted or threatened harmful contact (misdemeanor, typically up to 1 year). Aggravated assault: assault with a deadly weapon or intent to cause serious injury (felony, 5-20 years). MPC 211.1-211.2. Federal: 18 U.S.C. 113.',
        },
        {
            category: 'Murder / Homicide',
            canada: 'Criminal Code ss. 229-240. First-degree murder (planned and deliberate, or during listed offenses; mandatory life, 25-year parole ineligibility). Second-degree murder (intentional but not planned; life, 10-25-year parole ineligibility). Manslaughter (s. 234; no minimum except 4 years if firearm used).',
            us: 'First-degree: premeditated and deliberate killing (life or death penalty in 27 states). Second-degree: intentional but not premeditated (15 years to life). Felony murder doctrine applies broadly. Voluntary manslaughter: heat of passion (3-11 years). Involuntary manslaughter: criminal negligence (1-6 years). Federal: 18 U.S.C. 1111-1112.',
        },
        {
            category: 'Sexual Offenses',
            canada: 'Criminal Code ss. 271-273. Sexual assault (s. 271, hybrid, max 10 years), sexual assault with weapon/bodily harm (s. 272, max 14 years), aggravated sexual assault (s. 273, max life). Consent framework: ss. 273.1-273.2. No consent if complainant is incapable, in authority position, or consent obtained by abuse of trust.',
            us: 'Varies significantly by state. Generally: forcible rape (felony, 10 years to life), statutory rape (strict liability on age), sexual battery. Federal: 18 U.S.C. 2241-2248 (aggravated sexual abuse, up to life). MPC 213.1. Many states have tiered systems. Sex offender registration (SORNA) applies federally.',
        },
        {
            category: 'Drug Offenses',
            canada: 'Controlled Drugs and Substances Act (CDSA). Schedules I-VI. Trafficking (s. 5: Schedule I, max life; Schedule II, max life for over 3 kg). Possession (s. 4: Schedule I, max 7 years indictable). Cannabis regulated separately under Cannabis Act (2018). Drug Treatment Court programs available.',
            us: 'Controlled Substances Act, 21 U.S.C. 801+. Five schedules. Trafficking penalties vary: Schedule I/II (5-40 years first offense; life for large quantities). Simple possession: 21 U.S.C. 844 (misdemeanor first offense, up to 1 year). Mandatory minimums for specified quantities. State laws vary widely; some states have legalized cannabis.',
        },
        {
            category: 'Fraud',
            canada: 'Criminal Code s. 380. Fraud over $5,000 (indictable, max 14 years). Fraud under $5,000 (hybrid). Elements: deceit, falsehood, or other fraudulent means causing deprivation or risk of deprivation. Identity fraud (s. 403, max 10 years). Securities fraud carries enhanced penalties (s. 380.1).',
            us: 'Federal: wire fraud (18 U.S.C. 1343, max 20 years; 30 years if financial institution), mail fraud (18 U.S.C. 1341, max 20 years), bank fraud (18 U.S.C. 1344, max 30 years). Securities fraud: 15 U.S.C. 78j(b), max 20 years. State statutes vary. Sentencing Guidelines factor loss amount heavily.',
        },
        {
            category: 'DUI / Impaired Driving',
            canada: 'Criminal Code ss. 320.14-320.19. BAC limit: 80 mg/100 mL (0.08). Mandatory minimum fines: $1,000 (first), 30 days (second), 120 days (third). Impaired driving causing death: max life imprisonment. Mandatory alcohol ignition interlock. Refusal to provide sample is a separate offense (s. 320.15).',
            us: 'State-level offense. BAC limit: 0.08 nationally (0.05 in Utah). First offense: typically misdemeanor (up to 6 months, fines $500-$2,000). Felony DUI: usually third or fourth offense or if injury/death results. Implied consent laws; refusal triggers license suspension. Some states allow vehicular homicide charges (2-15 years).',
        },
        {
            category: 'Robbery',
            canada: 'Criminal Code ss. 343-346. Robbery: theft with violence or threats (max life). Elements: stealing plus using violence, threatening violence, assaulting, or having an offensive weapon. Aggravated with firearm: minimum 4 years. Stopping mail with intent: s. 345.',
            us: 'Common law: larceny from a person by force or intimidation. Federal: bank robbery (18 U.S.C. 2113, max 20 years; 25 years if assault; life if death results). State penalties: armed robbery typically 10-25 years. MPC 222.1: felony of the second degree. Carjacking: 18 U.S.C. 2119 (up to 25 years; life if death).',
        },
        {
            category: 'Arson',
            canada: 'Criminal Code ss. 433-436.1. Arson endangering life: s. 433 (max life). Arson damaging property: s. 434 (max 14 years). Arson of own property: s. 434.1 (max 14 years). Arson for fraudulent purpose: s. 435 (max 10 years). Negligent arson: s. 436 (max 5 years).',
            us: 'Federal: 18 U.S.C. 844(i) (arson affecting interstate commerce, 5-20 years; life if death). State laws generally distinguish degrees: first-degree (occupied structure, 10-25 years), second-degree (unoccupied structure, 5-15 years). MPC 220.1: felony of the second degree. Insurance fraud arson carries additional charges.',
        },
        {
            category: 'Cybercrime',
            canada: 'Criminal Code ss. 342.1-342.2 (unauthorized use of computer, max 10 years), s. 430(1.1) (mischief to data, max life if endangers life). Identity theft: s. 402.2 (max 5 years). Voyeurism: s. 162 (max 5 years). Distribution of intimate images: s. 162.1 (max 5 years indictable).',
            us: 'Computer Fraud and Abuse Act (CFAA), 18 U.S.C. 1030. Unauthorized access: up to 5 years (first offense), 10 years (repeat). Causing damage: up to 10 years. Trafficking in passwords: up to 10 years. Identity theft: 18 U.S.C. 1028A (mandatory 2-year consecutive). Wire fraud charges commonly added (max 20 years).',
        },
    ];

    const landmarkCasesCanada = [
        {
            name: 'R v. Oakes (1986)',
            citation: '[1986] 1 SCR 103',
            holding: 'Established the Oakes test for determining whether a Charter rights limitation is justified under s. 1. The government must show the limit is prescribed by law, has a pressing and substantial objective, and is proportional (rational connection, minimal impairment, proportionality of effects). Foundation of all Charter analysis.',
        },
        {
            name: 'R v. Jordan (2016)',
            citation: '2016 SCC 27',
            holding: 'Set presumptive ceilings for trial delay under s. 11(b) Charter right to be tried within a reasonable time: 18 months for provincial court cases and 30 months for superior court cases. Shifted burden to the Crown once the ceiling is exceeded. Transformed Canadian criminal procedure.',
        },
        {
            name: 'R v. Gladue (1999)',
            citation: '[1999] 1 SCR 688',
            holding: 'Interpreted s. 718.2(e) of the Criminal Code, requiring sentencing judges to consider all reasonable alternatives to incarceration for Aboriginal offenders and to take into account systemic and background factors. Established the Gladue principles for Indigenous sentencing.',
        },
        {
            name: 'R v. Grant (2009)',
            citation: '2009 SCC 32',
            holding: 'Revised the framework for excluding evidence under s. 24(2) of the Charter. Replaced the Collins/Stillman approach with a three-factor balancing test: seriousness of the Charter-infringing conduct, impact on the accused, and society\'s interest in adjudication on the merits.',
        },
        {
            name: 'R v. Stinchcombe (1991)',
            citation: '[1991] 3 SCR 326',
            holding: 'Established the Crown\'s constitutional obligation to disclose all relevant evidence to the defence, whether inculpatory or exculpatory, subject to privilege. The right to full disclosure is rooted in the right to make full answer and defence under ss. 7 and 11(d) of the Charter.',
        },
    ];

    const landmarkCasesUS = [
        {
            name: 'Miranda v. Arizona (1966)',
            citation: '384 U.S. 436',
            holding: 'Required law enforcement to inform suspects of their rights before custodial interrogation: right to remain silent, that statements may be used against them, right to an attorney, and right to appointed counsel if indigent. Statements obtained without Miranda warnings are generally inadmissible.',
        },
        {
            name: 'Gideon v. Wainwright (1963)',
            citation: '372 U.S. 335',
            holding: 'Held that the Sixth Amendment right to counsel is a fundamental right incorporated against the states through the Fourteenth Amendment. States are required to provide attorneys to criminal defendants who cannot afford one in all felony cases. Extended to misdemeanors in Argersinger v. Hamlin (1972).',
        },
        {
            name: 'Mapp v. Ohio (1961)',
            citation: '367 U.S. 643',
            holding: 'Applied the exclusionary rule to state courts through the Fourteenth Amendment Due Process Clause. Evidence obtained through unreasonable searches and seizures in violation of the Fourth Amendment must be excluded from state criminal proceedings. Landmark incorporation case.',
        },
        {
            name: 'Brady v. Maryland (1963)',
            citation: '373 U.S. 83',
            holding: 'Held that suppression by the prosecution of evidence favorable to the accused violates due process where the evidence is material either to guilt or punishment, irrespective of good faith or bad faith of the prosecution. Established the Brady disclosure obligation.',
        },
        {
            name: 'Batson v. Kentucky (1986)',
            citation: '476 U.S. 79',
            holding: 'Held that using peremptory challenges to exclude jurors solely on the basis of race violates the Equal Protection Clause. Established a three-step test: prima facie case of discrimination, race-neutral explanation, and court determination of intentional discrimination.',
        },
    ];

    const charterProtections = [
        {
            section: 'Section 7',
            title: 'Life, Liberty, and Security of the Person',
            description: 'Everyone has the right to life, liberty, and security of the person and the right not to be deprived thereof except in accordance with the principles of fundamental justice. Basis for challenges to overbroad or arbitrary criminal laws.',
        },
        {
            section: 'Section 8',
            title: 'Unreasonable Search or Seizure',
            description: 'Everyone has the right to be secure against unreasonable search or seizure. Requires prior judicial authorization (warrant) for most searches. Reasonable expectation of privacy analysis applies (R v. Edwards).',
        },
        {
            section: 'Section 9',
            title: 'Arbitrary Detention or Imprisonment',
            description: 'Everyone has the right not to be arbitrarily detained or imprisoned. Requires lawful authority and reasonable grounds for detention. Applies to police stops, investigative detentions, and arrests.',
        },
        {
            section: 'Section 10',
            title: 'Rights on Arrest or Detention',
            description: 'On arrest or detention: (a) right to be informed promptly of the reasons; (b) right to retain and instruct counsel without delay and to be informed of that right; (c) right to have validity of detention determined by habeas corpus.',
        },
        {
            section: 'Section 11',
            title: 'Proceedings in Criminal and Penal Matters',
            description: 'Rights of persons charged with offenses: (a) informed without unreasonable delay of the specific offense; (b) tried within a reasonable time; (c) not compelled to be a witness against oneself; (d) presumed innocent until proven guilty beyond a reasonable doubt; (e) not denied reasonable bail without just cause.',
        },
        {
            section: 'Section 12',
            title: 'Cruel and Unusual Treatment or Punishment',
            description: 'Everyone has the right not to be subjected to any cruel and unusual treatment or punishment. Applied to mandatory minimum sentences (e.g., R v. Nur, 2015 SCC 15) and conditions of confinement.',
        },
        {
            section: 'Section 13',
            title: 'Self-Crimination',
            description: 'A witness who testifies in any proceedings has the right not to have any incriminating evidence so given used to incriminate that witness in any other proceedings, except in a prosecution for perjury or for giving contradictory evidence.',
        },
        {
            section: 'Section 14',
            title: 'Interpreter',
            description: 'A party or witness in any proceedings who does not understand or speak the language in which the proceedings are conducted, or who is deaf, has the right to the assistance of an interpreter.',
        },
    ];

    const usAmendments = [
        {
            section: '4th Amendment',
            title: 'Search and Seizure',
            description: 'Protects against unreasonable searches and seizures. Requires probable cause for warrants, which must particularly describe the place to be searched and persons or things to be seized. Exclusionary rule applies (Mapp v. Ohio). Exceptions: consent, plain view, exigent circumstances, search incident to arrest.',
        },
        {
            section: '5th Amendment',
            title: 'Due Process and Self-Incrimination',
            description: 'Grand jury requirement for capital/infamous crimes; prohibition on double jeopardy; privilege against self-incrimination (basis for Miranda rights); due process of law requirement; just compensation for takings. Applies to federal government directly.',
        },
        {
            section: '6th Amendment',
            title: 'Right to a Fair Trial',
            description: 'Right to a speedy and public trial by an impartial jury; right to be informed of the nature and cause of the accusation; right to confront witnesses; right to compulsory process for obtaining favorable witnesses; right to the assistance of counsel (Gideon v. Wainwright).',
        },
        {
            section: '8th Amendment',
            title: 'Bail, Fines, and Punishment',
            description: 'Prohibits excessive bail, excessive fines, and cruel and unusual punishments. Limits on the death penalty (Roper v. Simmons for juveniles; Atkins v. Virginia for intellectual disability). Proportionality principle for sentences (Graham v. Florida; Miller v. Alabama).',
        },
        {
            section: '14th Amendment',
            title: 'Equal Protection and Due Process',
            description: 'Extends due process protections to state government actions (incorporation doctrine). Equal protection clause prohibits discriminatory application of criminal laws. Basis for incorporating Bill of Rights protections against the states. Applies strict scrutiny to racial classifications.',
        },
    ];

    const researchFocusAreas = [
        {
            icon: Brain,
            title: 'Offense Elements & Mental States',
            description: 'Comprehensive analysis of actus reus (guilty act) and mens rea (guilty mind) requirements for each offense. Covers specific intent vs. general intent offenses, strict liability, recklessness, criminal negligence, and knowledge requirements across both jurisdictions.',
            details: [
                'Actus reus: voluntary act, omission where duty exists, possession, status offenses',
                'Mens rea hierarchy: purposely, knowingly, recklessly, negligently (MPC framework)',
                'Canadian approach: subjective vs. objective fault standards',
                'Transferred intent, willful blindness, and constructive mens rea',
                'Strict and absolute liability offenses: regulatory context',
            ],
        },
        {
            icon: Shield,
            title: 'Defenses & Justifications',
            description: 'Complete mapping of criminal defenses available in Canada and the United States, including justifications (self-defense, necessity, defense of property), excuses (duress, automatism, mental disorder), and procedural defenses.',
            details: [
                'Self-defense: Criminal Code s. 34 (Canada) vs. castle doctrine and stand-your-ground laws (US)',
                'Mental disorder / insanity: NCR (Canada, Criminal Code s. 16) vs. M\'Naghten, MPC, and state-specific tests',
                'Duress: s. 17 (Canada) vs. common law duress defense (US)',
                'Necessity, provocation, entrapment, intoxication, mistake of fact',
                'Charter / Constitutional defenses: abuse of process, unreasonable delay, illegal search',
            ],
        },
        {
            icon: Landmark,
            title: 'Criminal Procedure',
            description: 'Step-by-step procedural analysis from investigation through appeal in both jurisdictions. Covers arrest powers, bail and pretrial release, disclosure obligations, preliminary hearings, trial procedures, and appellate processes.',
            details: [
                'Arrest: reasonable grounds (Canada) vs. probable cause (US)',
                'Bail: ladder principle and s. 515 (Canada) vs. Bail Reform Act (US federal)',
                'Disclosure: Stinchcombe obligation (Canada) vs. Brady/Giglio (US)',
                'Preliminary inquiries (Canada) vs. grand jury proceedings (US)',
                'Trial by judge alone vs. jury, election of mode of trial, plea bargaining',
            ],
        },
        {
            icon: Scale,
            title: 'Sentencing Frameworks',
            description: 'Detailed comparison of sentencing principles, ranges, and guidance. Canadian proportionality and restraint principles vs. US federal Sentencing Guidelines and state frameworks. Mandatory minimums, conditional sentences, and alternative measures.',
            details: [
                'Canadian principles: s. 718 (purpose), s. 718.1 (proportionality), s. 718.2 (restraint)',
                'US Federal Sentencing Guidelines: offense level, criminal history, departures',
                'Mandatory minimums: constitutional challenges in both jurisdictions',
                'Conditional sentences (Canada) vs. probation and supervised release (US)',
                'Parole eligibility, dangerous offender / habitual offender designations',
            ],
        },
        {
            icon: Search,
            title: 'Evidence & Admissibility',
            description: 'Rules governing the admissibility of evidence in criminal proceedings. Hearsay exceptions, character evidence, expert testimony, electronic evidence, and the exclusionary rule under both Charter s. 24(2) and the US Fourth Amendment.',
            details: [
                'Exclusionary rules: s. 24(2) Grant test (Canada) vs. fruit of the poisonous tree (US)',
                'Hearsay: principled approach (Canada) vs. Federal Rules of Evidence 801-807 (US)',
                'Character evidence: similar fact evidence (Canada) vs. FRE 404 (US)',
                'Expert testimony: Mohan test (Canada) vs. Daubert standard (US)',
                'Digital evidence, wiretap authorization, and social media evidence',
            ],
        },
        {
            icon: Fingerprint,
            title: 'Specialized Crime Areas',
            description: 'Focused research on youth criminal justice (YCJA / juvenile courts), cybercrime legislation, organized crime provisions, terrorism offenses, and proceeds of crime. Includes cross-jurisdictional enforcement mechanisms.',
            details: [
                'Youth justice: Youth Criminal Justice Act (Canada) vs. state juvenile court systems (US)',
                'Cybercrime: Criminal Code Part VI (Canada) vs. CFAA and state equivalents (US)',
                'Organized crime: Criminal Code Part XIII (Canada) vs. RICO (US)',
                'Terrorism: Criminal Code Part II.1 (Canada) vs. 18 U.S.C. Chapter 113B (US)',
                'Proceeds of crime: Part XII.2 (Canada) vs. 18 U.S.C. 1956-1957 (US)',
            ],
        },
        {
            icon: HeartHandshake,
            title: 'Victim Rights & Restitution',
            description: 'Comprehensive overview of victim rights legislation in both countries. Canadian Victims Bill of Rights (2015) and provincial victim services vs. US federal Crime Victims\' Rights Act and state constitutional amendments (Marsy\'s Law).',
            details: [
                'Canadian Victims Bill of Rights: right to information, protection, participation, restitution',
                'US Crime Victims\' Rights Act (18 U.S.C. 3771): right to be heard, right to proceedings free from unreasonable delay',
                'Victim impact statements at sentencing in both jurisdictions',
                'Restitution orders: Criminal Code s. 738 (Canada) vs. Mandatory Victims Restitution Act (US)',
                'Publication bans, testimonial aids, and vulnerable witness protections',
            ],
        },
        {
            icon: Network,
            title: 'Cross-Border Considerations',
            description: 'Legal issues arising from cross-border criminal activity between Canada and the United States. Extradition, mutual legal assistance, joint investigations, and the impact of different legal standards on transnational prosecutions.',
            details: [
                'Extradition Act (Canada) and Canada-US Extradition Treaty',
                'Mutual Legal Assistance in Criminal Matters Act (Canada) and MLAT',
                'Double criminality requirement and political offense exception',
                'Cross-border evidence gathering and Charter/Constitutional protections',
                'Transfer of offenders and recognition of foreign sentences',
            ],
        },
    ];

    const deliverables = [
        {
            icon: FileText,
            title: 'Research Dossiers',
            detail: 'Comprehensive topic briefs for each offense and legal area, with full citations, element breakdowns, available defenses, sentencing ranges, and case summaries from both jurisdictions.',
        },
        {
            icon: Map,
            title: 'Comparative Matrices',
            detail: 'Side-by-side mappings of Canada vs. United States rules, definitions, elements, penalties, and procedures. Structured for quick lookup and AI-powered comparison queries.',
        },
        {
            icon: BookOpen,
            title: 'Source Index',
            detail: 'Curated index of primary sources (statutes, regulations, case law) and secondary sources (treatises, commentary) with freshness dates, official URLs, and reliability ratings.',
        },
        {
            icon: Sparkles,
            title: 'AI-Ready Notes',
            detail: 'Structured notes optimized for RAG retrieval and question answering. Each entry tagged by jurisdiction, topic, offense type, and procedural stage for precise AI grounding.',
        },
    ];

    const toggleArea = (index) => {
        setExpandedArea(expandedArea === index ? null : index);
    };

    return (
        <PageWrapper title="Research">
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>

                {/* Hero Section */}
                <div className="mb-12">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border bg-gradient-to-r ${isDark
                        ? 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-200'
                        : 'from-emerald-50 to-teal-50 border-emerald-200 text-emerald-700'
                        }`}>
                        <Scale className="w-4 h-4" />
                        Criminal Law Research Program
                    </span>
                    <h2 className={`text-3xl md:text-5xl font-bold mt-4 mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Canada + US Criminal Law Research
                    </h2>
                    <p className="text-lg max-w-4xl leading-relaxed">
                        A structured, citation-forward bi-national research program powering the Kimuntu AI Legal Track and AI assistant. This program provides comprehensive coverage of criminal offenses, defenses, constitutional protections, sentencing frameworks, and procedural rules across Canadian federal law and United States federal and state law, grounded in primary sources and landmark case law.
                    </p>
                </div>

                {/* Stats Bar */}
                <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 p-6 rounded-2xl border ${isDark
                    ? 'bg-gradient-to-r from-emerald-500/10 via-white/5 to-teal-500/10 border-white/10'
                    : 'bg-gradient-to-r from-emerald-50 via-white to-teal-50 border-gray-200'
                    }`}>
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center">
                            <p className={`text-3xl md:text-4xl font-bold ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}>
                                {stat.value}
                            </p>
                            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Research Pillars */}
                <section className="mb-14">
                    <h3 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Research Pillars
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {pillars.map((pillar, index) => (
                            <div
                                key={index}
                                className={`p-6 rounded-2xl border backdrop-blur-xl transition-all hover:scale-[1.02] ${isDark
                                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                                    : 'bg-white/60 border-gray-200 hover:bg-white/80'
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                                    <pillar.icon className={`w-6 h-6 ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`} />
                                </div>
                                <h4 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {pillar.title}
                                </h4>
                                <p className="text-sm leading-relaxed">{pillar.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Detailed Offense Comparison Table */}
                <section className="mb-14">
                    <h3 className={`text-2xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Detailed Offense Comparison
                    </h3>
                    <p className="mb-6 text-sm">
                        Side-by-side analysis of 10 major criminal offense categories with statute references, elements, and penalty ranges.
                    </p>
                    <div className={`overflow-x-auto rounded-2xl border backdrop-blur-xl ${isDark
                        ? 'bg-white/5 border-white/10'
                        : 'bg-white/60 border-gray-200'
                        }`}>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className={isDark ? 'text-emerald-200' : 'text-emerald-700'}>
                                    <th className="px-5 py-4 text-left font-semibold w-[120px] min-w-[120px]">Category</th>
                                    <th className="px-5 py-4 text-left font-semibold">Canada</th>
                                    <th className="px-5 py-4 text-left font-semibold">United States</th>
                                </tr>
                            </thead>
                            <tbody className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                                {offenseComparisons.map((offense, index) => (
                                    <tr key={index} className={`${isDark ? 'border-t border-white/10' : 'border-t border-gray-200'} ${index % 2 === 0
                                        ? isDark ? 'bg-white/[0.02]' : 'bg-gray-50/50'
                                        : ''
                                        }`}>
                                        <td className={`px-5 py-4 font-semibold align-top ${isDark ? 'text-emerald-200' : 'text-emerald-700'}`}>
                                            {offense.category}
                                        </td>
                                        <td className="px-5 py-4 align-top leading-relaxed">{offense.canada}</td>
                                        <td className="px-5 py-4 align-top leading-relaxed">{offense.us}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Landmark Cases Section */}
                <section className="mb-14">
                    <h3 className={`text-2xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Landmark Criminal Law Cases
                    </h3>
                    <p className="mb-6 text-sm">
                        Foundational decisions that shaped criminal law doctrine and constitutional protections in each jurisdiction.
                    </p>

                    {/* Jurisdiction Tabs */}
                    <div className="flex gap-2 mb-6">
                        <button
                            onClick={() => setActiveJurisdictionTab('canada')}
                            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeJurisdictionTab === 'canada'
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                                : isDark
                                    ? 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                                    : 'bg-white/60 border border-gray-200 text-gray-700 hover:bg-white/80'
                                }`}
                        >
                            Canada
                        </button>
                        <button
                            onClick={() => setActiveJurisdictionTab('us')}
                            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeJurisdictionTab === 'us'
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                                : isDark
                                    ? 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                                    : 'bg-white/60 border border-gray-200 text-gray-700 hover:bg-white/80'
                                }`}
                        >
                            United States
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(activeJurisdictionTab === 'canada' ? landmarkCasesCanada : landmarkCasesUS).map((caseItem, index) => (
                            <div
                                key={index}
                                className={`p-5 rounded-2xl border backdrop-blur-xl transition-all hover:scale-[1.01] ${isDark
                                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                                    : 'bg-white/60 border-gray-200 hover:bg-white/80'
                                    }`}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                                        <Gavel className={`w-5 h-5 ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`} />
                                    </div>
                                    <div>
                                        <h4 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {caseItem.name}
                                        </h4>
                                        <p className={`text-xs ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}>
                                            {caseItem.citation}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-sm leading-relaxed">{caseItem.holding}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Constitutional Protections Comparison */}
                <section className="mb-14">
                    <h3 className={`text-2xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Constitutional Protections Comparison
                    </h3>
                    <p className="mb-6 text-sm">
                        Side-by-side mapping of criminal justice protections under the Canadian Charter of Rights and Freedoms and the United States Constitution.
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Canada - Charter */}
                        <div className={`p-6 rounded-2xl border backdrop-blur-xl ${isDark
                            ? 'bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20'
                            : 'bg-gradient-to-br from-emerald-50 to-white border-emerald-200'
                            }`}>
                            <div className="flex items-center gap-3 mb-5">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                                    <BookMarked className={`w-5 h-5 ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`} />
                                </div>
                                <div>
                                    <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        Canadian Charter of Rights and Freedoms
                                    </h4>
                                    <p className={`text-xs ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}>
                                        Part I of the Constitution Act, 1982
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {charterProtections.map((item, index) => (
                                    <div key={index} className={`p-4 rounded-xl border ${isDark
                                        ? 'bg-black/20 border-white/5'
                                        : 'bg-white/70 border-gray-100'
                                        }`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${isDark
                                                ? 'bg-emerald-500/30 text-emerald-200'
                                                : 'bg-emerald-100 text-emerald-700'
                                                }`}>
                                                {item.section}
                                            </span>
                                            <h5 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                {item.title}
                                            </h5>
                                        </div>
                                        <p className="text-xs leading-relaxed mt-2">{item.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* US - Amendments */}
                        <div className={`p-6 rounded-2xl border backdrop-blur-xl ${isDark
                            ? 'bg-gradient-to-br from-teal-500/10 to-transparent border-teal-500/20'
                            : 'bg-gradient-to-br from-teal-50 to-white border-teal-200'
                            }`}>
                            <div className="flex items-center gap-3 mb-5">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-teal-500/20' : 'bg-teal-100'}`}>
                                    <Landmark className={`w-5 h-5 ${isDark ? 'text-teal-300' : 'text-teal-600'}`} />
                                </div>
                                <div>
                                    <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        United States Constitution
                                    </h4>
                                    <p className={`text-xs ${isDark ? 'text-teal-300' : 'text-teal-600'}`}>
                                        Bill of Rights and Fourteenth Amendment
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {usAmendments.map((item, index) => (
                                    <div key={index} className={`p-4 rounded-xl border ${isDark
                                        ? 'bg-black/20 border-white/5'
                                        : 'bg-white/70 border-gray-100'
                                        }`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${isDark
                                                ? 'bg-teal-500/30 text-teal-200'
                                                : 'bg-teal-100 text-teal-700'
                                                }`}>
                                                {item.section}
                                            </span>
                                            <h5 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                {item.title}
                                            </h5>
                                        </div>
                                        <p className="text-xs leading-relaxed mt-2">{item.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Research Focus Areas */}
                <section className="mb-14">
                    <h3 className={`text-2xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Research Focus Areas
                    </h3>
                    <p className="mb-6 text-sm">
                        Eight core research streams covering every aspect of criminal law practice and scholarship.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {researchFocusAreas.map((area, index) => (
                            <div
                                key={index}
                                className={`rounded-2xl border backdrop-blur-xl transition-all ${isDark
                                    ? 'bg-white/5 border-white/10 hover:bg-white/[0.08]'
                                    : 'bg-white/60 border-gray-200 hover:bg-white/80'
                                    }`}
                            >
                                <button
                                    onClick={() => toggleArea(index)}
                                    className="w-full p-5 flex items-start gap-4 text-left"
                                >
                                    <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                                        <area.icon className={`w-5 h-5 ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <h4 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                {area.title}
                                            </h4>
                                            {expandedArea === index
                                                ? <ChevronUp className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`} />
                                                : <ChevronDown className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                                            }
                                        </div>
                                        <p className="text-sm leading-relaxed mt-1">{area.description}</p>
                                    </div>
                                </button>
                                {expandedArea === index && (
                                    <div className={`px-5 pb-5 pt-0 ml-14`}>
                                        <div className={`p-4 rounded-xl border ${isDark
                                            ? 'bg-black/20 border-white/5'
                                            : 'bg-gray-50 border-gray-100'
                                            }`}>
                                            <ul className="space-y-2.5">
                                                {area.details.map((detail, idx) => (
                                                    <li key={idx} className="flex items-start gap-2.5 text-sm">
                                                        <span className={`mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 ${isDark ? 'bg-emerald-400' : 'bg-emerald-600'}`}></span>
                                                        <span className="leading-relaxed">{detail}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Methodology Section */}
                <section className="mb-14">
                    <h3 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Methodology
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className={`p-6 rounded-2xl border backdrop-blur-xl ${isDark
                            ? 'bg-white/5 border-white/10'
                            : 'bg-white/60 border-gray-200'
                            }`}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                                    <Crosshair className={`w-5 h-5 ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`} />
                                </div>
                                <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Source Strategy
                                </h4>
                            </div>
                            <ul className="space-y-3">
                                {[
                                    'Primary statutes: Criminal Code (R.S.C. 1985, c. C-46), Title 18 U.S.C., and state criminal codes',
                                    'Official legislation portals: Justice Laws Canada, congress.gov, state legislature sites',
                                    'High-court decisions from official reporters: SCR, S.Ct., F.3d',
                                    'Sentencing guidance: Canadian Sentencing Commission reports, U.S. Sentencing Guidelines Manual',
                                    'Secondary sources for context: Halsbury\'s Laws of Canada, LaFave\'s Criminal Law treatise',
                                    'Government databases: CanLII, Westlaw, LexisNexis, PACER',
                                ].map((item, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <span className={`mt-2 w-2 h-2 rounded-full flex-shrink-0 ${isDark ? 'bg-emerald-400' : 'bg-emerald-600'}`}></span>
                                        <span className="text-sm leading-relaxed">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className={`p-6 rounded-2xl border backdrop-blur-xl ${isDark
                            ? 'bg-white/5 border-white/10'
                            : 'bg-white/60 border-gray-200'
                            }`}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                                    <AlertTriangle className={`w-5 h-5 ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`} />
                                </div>
                                <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    QA & Review
                                </h4>
                            </div>
                            <ul className="space-y-3">
                                {[
                                    'Dual-source verification: every statutory reference and case citation independently confirmed',
                                    'Change tracking with version history and update timestamps on all research entries',
                                    'Legal review checklist applied to all high-impact topics (homicide, sexual offenses, Charter rights)',
                                    'Cross-jurisdiction consistency checks: ensure parallel treatment of equivalent offenses',
                                    'Structured data validation: schema compliance for AI retrieval pipeline compatibility',
                                    'Periodic currency audit: flag entries older than 12 months for review against legislative amendments',
                                ].map((item, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <span className={`mt-2 w-2 h-2 rounded-full flex-shrink-0 ${isDark ? 'bg-emerald-400' : 'bg-emerald-600'}`}></span>
                                        <span className="text-sm leading-relaxed">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Research Deliverables */}
                <section className="mb-14">
                    <h3 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Research Deliverables
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {deliverables.map((item, index) => (
                            <div
                                key={index}
                                className={`p-6 rounded-2xl border backdrop-blur-xl transition-all hover:scale-[1.02] ${isDark
                                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                                    : 'bg-white/60 border-gray-200 hover:bg-white/80'
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                                    <item.icon className={`w-6 h-6 ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`} />
                                </div>
                                <h4 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {item.title}
                                </h4>
                                <p className="text-sm leading-relaxed">{item.detail}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA Footer */}
                <section className={`p-8 rounded-2xl border ${isDark
                    ? 'bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10 border-white/10'
                    : 'bg-gradient-to-br from-emerald-100 via-white to-teal-100 border-gray-200'
                    }`}>
                    <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center ${isDark ? 'bg-white/10' : 'bg-white/80'}`}>
                            <Gavel className={`w-6 h-6 ${isDark ? 'text-emerald-200' : 'text-emerald-700'}`} />
                        </div>
                        <div>
                            <h3 className={`text-2xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Ready for Database Population
                            </h3>
                            <p className="mb-4 max-w-2xl leading-relaxed">
                                Research outputs are structured for direct ingestion into the Kimuntu AI legal database, enabling fast retrieval, comparative analysis, and grounded AI responses across both Canadian and United States criminal law.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <a
                                    href="/database"
                                    className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 transition-all"
                                >
                                    View Database Plan
                                </a>
                                <a
                                    href="/chat"
                                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${isDark
                                        ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                                        : 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    Try Legal AI Demo
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </PageWrapper>
    );
};

export default Research;
