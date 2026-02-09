'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import PageWrapper from '@/components/PageWrapper';
import { useTheme } from '@/components/providers/ThemeProvider';
import {
    Bot,
    Send,
    RotateCcw,
    Sparkles,
    MessageSquare,
    Database,
    Scale,
    ShieldAlert,
    BookOpen,
    ChevronDown,
    ChevronUp,
    ExternalLink,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Streaming text hook - reveals text word-by-word                     */
/* ------------------------------------------------------------------ */
const useStreamingText = (fullText, isStreaming, speed = 30) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isDone, setIsDone] = useState(false);

    useEffect(() => {
        if (!isStreaming || !fullText) {
            setDisplayedText(fullText || '');
            setIsDone(true);
            return;
        }

        setDisplayedText('');
        setIsDone(false);
        let charIndex = 0;

        const interval = setInterval(() => {
            if (charIndex < fullText.length) {
                // Reveal in small chunks (2-4 chars at a time for natural feel)
                const chunkSize = fullText[charIndex] === ' ' ? 1 : Math.min(2 + Math.floor(Math.random() * 3), fullText.length - charIndex);
                charIndex += chunkSize;
                setDisplayedText(fullText.slice(0, charIndex));
            } else {
                setIsDone(true);
                clearInterval(interval);
            }
        }, speed);

        return () => clearInterval(interval);
    }, [fullText, isStreaming, speed]);

    return { displayedText, isDone };
};

/* ------------------------------------------------------------------ */
/*  Starter prompts shown as pill buttons above the input              */
/* ------------------------------------------------------------------ */
const starterPrompts = [
    'Compare theft laws in Canada vs US',
    'Explain self-defense standards',
    'How does bail work?',
    'Murder classifications compared',
    'Search and seizure rights',
    'Youth justice differences',
    'Drug offense penalties',
    'Right to counsel explained',
];

/* ------------------------------------------------------------------ */
/*  Demo response builder - 15+ topics with detailed legal info        */
/* ------------------------------------------------------------------ */
const buildDemoResponse = (text) => {
    const query = text.toLowerCase();

    /* Theft / Larceny */
    if (query.includes('theft') || query.includes('larceny') || query.includes('steal') || query.includes('stolen')) {
        return 'In Canada, theft is codified under section 322 of the Criminal Code and is divided into theft over $5,000 (indictable, up to 10 years) and theft under $5,000 (hybrid offense). The Crown must prove a fraudulent taking, moving, or conversion of property without colour of right and with intent to deprive the owner. In the United States, theft definitions vary by state: most jurisdictions distinguish between petty theft (misdemeanor) and grand theft (felony) based on the value of the property taken, with thresholds ranging from $500 to $2,500 depending on the state. The Model Penal Code consolidates common-law larceny, embezzlement, and obtaining by false pretenses into a single theft offense. A key comparative difference is that Canadian law uses a single unified theft provision, whereas many U.S. states still maintain separate statutes for larceny, robbery, and embezzlement.';
    }

    /* Assault */
    if (query.includes('assault') || query.includes('battery')) {
        return 'Under the Canadian Criminal Code, assault is defined at sections 265 through 268 and encompasses applying force intentionally, attempting or threatening to apply force, and accosting or impeding a person while openly wearing or carrying a weapon. Aggravated assault (s.268) involves wounding, maiming, disfiguring, or endangering life and carries a maximum of 14 years. In the United States, common-law assault and battery are often treated as separate offenses: assault is the apprehension of imminent harmful contact, while battery is the actual unlawful touching. The Model Penal Code (MPC section 211.1) unifies these into a single assault provision with simple and aggravated categories. Many U.S. states add specific degrees of assault, with first-degree aggravated assault carrying sentences of 5 to 25 years depending on the jurisdiction and whether a deadly weapon was used.';
    }

    /* Self-defense */
    if (query.includes('self-defense') || query.includes('self defense') || query.includes('stand your ground') || query.includes('castle doctrine')) {
        return 'Canada reformed its self-defense law in 2012 under section 34 of the Criminal Code, replacing the old sections 34-37 with a single, unified provision. The test asks whether the accused believed on reasonable grounds that force was being used or threatened, whether the defensive act was committed for the purpose of defending themselves or others, and whether the act was reasonable in the circumstances. Courts consider factors such as the nature of the threat, the proportionality of the response, the size and physical capabilities of the parties, and any prior relationship. In the United States, self-defense standards vary significantly: roughly 30 states have adopted "stand your ground" laws that remove the duty to retreat before using force in any place the defender has a lawful right to be. Other states follow the "castle doctrine," which eliminates the duty to retreat only within one\'s home. The remaining jurisdictions require a duty to retreat when safe to do so before resorting to deadly force. The MPC (section 3.04) generally requires retreat when it can be done with complete safety, except in one\'s dwelling.';
    }

    /* Bail */
    if (query.includes('bail') || query.includes('pretrial') || query.includes('detention') || query.includes('remand')) {
        return 'Canada\'s bail system operates under sections 515-524 of the Criminal Code and is governed by the "ladder principle," which requires the justice to consider the least restrictive form of release first. The starting point is unconditional release on an undertaking, escalating through conditions, sureties, and cash deposits, with detention being the last resort. The Crown must show cause for detention on one of three grounds: ensuring attendance (primary), public safety (secondary), or maintaining confidence in the administration of justice (tertiary). In the United States, the federal Bail Reform Act of 1984 (18 U.S.C. sections 3141-3156) establishes a presumption of release on personal recognizance or unsecured bond, but permits pretrial detention if no conditions can reasonably assure community safety or court appearance. Many U.S. states still rely heavily on cash bail schedules, although a growing reform movement has led jurisdictions like New Jersey, Illinois, and New York to reduce or eliminate money bail. The Supreme Court of Canada\'s decision in R. v. Antic (2017) reinforced the ladder principle, while in the U.S., Stack v. Boyle (1951) established that bail set higher than necessary to ensure appearance is excessive.';
    }

    /* Murder / Homicide */
    if (query.includes('murder') || query.includes('homicide') || query.includes('manslaughter') || query.includes('killing')) {
        return 'Canadian criminal law classifies culpable homicide into three categories: murder (first degree and second degree), manslaughter, and infanticide (Criminal Code ss.229-240). First-degree murder includes planned and deliberate killings, murder of a peace officer, and murder committed during certain offenses like kidnapping or sexual assault; it carries a mandatory life sentence with no parole eligibility for 25 years. Second-degree murder carries a mandatory life sentence with parole eligibility between 10 and 25 years. In the United States, homicide classifications vary by jurisdiction but generally include first-degree murder (premeditated and deliberate), second-degree murder (intentional but not premeditated), voluntary manslaughter (heat of passion), and involuntary manslaughter (criminal negligence or misdemeanor-manslaughter). Under the MPC, criminal homicide is divided into murder, manslaughter, and negligent homicide. The felony murder rule, which holds a defendant liable for deaths occurring during the commission of certain felonies, is a significant feature of U.S. law that has no direct equivalent in Canada, where liability for deaths during unlawful acts is handled under constructive murder provisions that have been narrowed by the Charter.';
    }

    /* Drug offenses */
    if (query.includes('drug') || query.includes('narcotic') || query.includes('substance') || query.includes('cannabis') || query.includes('marijuana')) {
        return 'In Canada, drug offenses are governed by the Controlled Drugs and Substances Act (CDSA), which schedules substances across Schedules I through VI and creates offenses for possession, trafficking, production, and importing/exporting. Schedule I substances (heroin, cocaine, fentanyl) carry the most severe penalties: trafficking can result in a life sentence, and possession carries up to 7 years for an indictable offense. Cannabis was legalized for adult recreational use under the Cannabis Act (2018), though offenses remain for unlicensed trafficking and distribution to minors. In the United States, the federal Controlled Substances Act (CSA, 21 U.S.C. section 801 et seq.) classifies drugs into five schedules, with Schedule I substances (heroin, LSD, and, federally, still cannabis) carrying the harshest penalties. Federal mandatory minimums are a significant feature: for example, 5 grams of crack cocaine triggers a 5-year minimum, while 500 grams triggers 10 years. State drug laws vary enormously, with some states having decriminalized or legalized cannabis while others maintain strict prohibition.';
    }

    /* DUI / Impaired driving */
    if (query.includes('dui') || query.includes('dwi') || query.includes('impaired') || query.includes('drunk driv') || query.includes('driving')) {
        return 'Canada overhauled its impaired driving laws in December 2018 under Criminal Code section 320.14, making impaired driving offenses among the most commonly prosecuted criminal charges in the country. The legal blood alcohol concentration (BAC) limit is 80 mg per 100 mL of blood (0.08%), and officers now have mandatory alcohol screening powers at roadside stops without requiring reasonable suspicion. Penalties for a first offense include a mandatory minimum fine of $1,000 and a federal driving prohibition of at least one year, escalating to mandatory imprisonment of 30 days for a second offense and 120 days for a third. In the United States, DUI/DWI laws are primarily state-level, with all 50 states setting the per se BAC limit at 0.08% (0.04% for commercial drivers). Penalties vary dramatically by state: first offenses are typically misdemeanors with fines ranging from $500 to $2,000, possible jail time of 1 to 180 days, and license suspension of 90 days to one year. Some states have enhanced penalties for BAC levels of 0.15% or higher, and many states impose ignition interlock device requirements.';
    }

    /* Search and seizure / Evidence */
    if (query.includes('search') || query.includes('seizure') || query.includes('evidence') || query.includes('warrant') || query.includes('fourth amendment') || query.includes('charter')) {
        return 'Section 8 of the Canadian Charter of Rights and Freedoms protects against unreasonable search and seizure, with the Supreme Court of Canada establishing in Hunter v. Southam (1984) that a search must be authorized by law, the authorizing law must be reasonable, and the search must be carried out in a reasonable manner. Evidence obtained in violation of Charter rights may be excluded under section 24(2) if its admission would bring the administration of justice into disrepute, using the Grant framework (R. v. Grant, 2009) that weighs the seriousness of the violation, the impact on the accused\'s rights, and society\'s interest in adjudication on the merits. In the United States, the Fourth Amendment protects against unreasonable searches and seizures and requires warrants to be supported by probable cause. The exclusionary rule, established in Weeks v. United States (1914) and applied to the states in Mapp v. Ohio (1961), generally bars the prosecution from using evidence obtained in violation of the Fourth Amendment. The U.S. approach features numerous exceptions including search incident to arrest, plain view, exigent circumstances, automobile searches, and consent searches. A notable difference is that Canada\'s section 24(2) analysis involves a balancing test, whereas the U.S. exclusionary rule is more categorical, though the good-faith exception (United States v. Leon, 1984) has softened its application.';
    }

    /* Right to counsel */
    if (query.includes('counsel') || query.includes('lawyer') || query.includes('miranda') || query.includes('right to') || query.includes('attorney')) {
        return 'Section 10(b) of the Canadian Charter guarantees the right to retain and instruct counsel without delay upon arrest or detention, and to be informed of that right. Police must provide a reasonable opportunity to exercise this right and must refrain from eliciting evidence until the detainee has had that opportunity (R. v. Sinclair, 2010). Legal Aid duty counsel services operate across all provinces to ensure access for those who cannot afford a lawyer. Unlike the U.S. Miranda requirement, Canada does not require that a lawyer be present during interrogation, only that the accused be given a reasonable opportunity to consult with counsel before questioning. In the United States, the Sixth Amendment guarantees the right to counsel in all criminal prosecutions, and Miranda v. Arizona (1966) requires that custodial suspects be informed of their right to remain silent and their right to an attorney before interrogation. If a suspect invokes their right to counsel, all questioning must cease until an attorney is present (Edwards v. Arizona, 1981). The U.S. system also provides court-appointed counsel for indigent defendants under Gideon v. Wainwright (1963), which applies to all felony cases and, through subsequent decisions, to misdemeanors involving actual imprisonment.';
    }

    /* Sentencing */
    if (query.includes('sentenc') || query.includes('punishment') || query.includes('penalty') || query.includes('prison') || query.includes('incarcerat')) {
        return 'Canadian sentencing is guided by the fundamental principle of proportionality (Criminal Code s.718.1) and the fundamental purpose of contributing to respect for the law and maintenance of a just, peaceful society (s.718). Courts must consider objectives including denunciation, deterrence, separation of offenders, rehabilitation, reparation, and promoting a sense of responsibility. The Gladue principle (R. v. Gladue, 1999; s.718.2(e)) requires judges to pay particular attention to the circumstances of Indigenous offenders and consider all reasonable alternatives to imprisonment. Conditional sentence orders allow offenders serving sentences under two years to serve them in the community under strict conditions. In the United States, federal sentencing is governed by the U.S. Sentencing Guidelines, which, since United States v. Booker (2005), are advisory rather than mandatory. The guidelines use a grid system based on offense severity level and criminal history category to produce a sentencing range. Mandatory minimum sentences remain a significant feature of federal and state law, particularly for drug offenses and firearms crimes. A key comparative difference is that Canada generally allows broader judicial discretion in sentencing, while the U.S. system tends to be more structured and prescriptive.';
    }

    /* Youth justice */
    if (query.includes('youth') || query.includes('juvenile') || query.includes('young offender') || query.includes('minor') || query.includes('teen')) {
        return 'Canada\'s Youth Criminal Justice Act (YCJA, 2003) governs proceedings for young persons aged 12 to 17 and emphasizes rehabilitation, meaningful consequences, and the diminished moral blameworthiness of young people. The YCJA establishes a presumption against custody for non-violent offenses and requires that extrajudicial measures (warnings, cautions, referrals, and extrajudicial sanctions) be considered before formal court proceedings. Youth sentences include reprimands, community service orders, probation, intensive support and supervision, deferred custody, and custody and supervision orders, with maximum youth sentences of 3 years for most offenses and 10 years for serious violent offenses where an adult sentence is not imposed. Publication bans protect the identity of young offenders in most circumstances. In the United States, juvenile justice is primarily a state-level system, with each state establishing its own juvenile court jurisdiction (typically up to age 17 or 18), procedures, and dispositional options. Transfer or waiver mechanisms allow juveniles to be tried as adults for serious offenses, and the criteria and procedures vary significantly by state. The Supreme Court has placed constitutional limits on juvenile punishment, including banning the death penalty for juveniles (Roper v. Simmons, 2005) and prohibiting mandatory life without parole for juvenile offenders (Miller v. Alabama, 2012).';
    }

    /* Fraud */
    if (query.includes('fraud') || query.includes('forgery') || query.includes('deception') || query.includes('scam')) {
        return 'In Canada, fraud is broadly defined under section 380 of the Criminal Code as the use of deceit, falsehood, or other fraudulent means to deprive any person of property, money, valuable security, or any service. Fraud over $5,000 is an indictable offense carrying a maximum of 14 years, with a mandatory minimum of 2 years if the value exceeds $1 million. The Supreme Court of Canada in R. v. Theroux (1993) established that fraud requires dishonest action (the actus reus of deceit or other fraudulent means causing deprivation) and subjective knowledge of the prohibited act (mens rea). In the United States, fraud is prosecuted under numerous federal statutes, most notably wire fraud (18 U.S.C. section 1343) and mail fraud (18 U.S.C. section 1341), each carrying penalties of up to 20 years (or 30 years if involving a financial institution). The elements require a scheme to defraud, intent to defraud, and the use of the mails or wires in furtherance of the scheme. Securities fraud, healthcare fraud, bank fraud, and identity theft each have their own dedicated federal statutes with varying penalty ranges. The broad sweep of U.S. federal fraud statutes gives prosecutors considerable flexibility, while Canada\'s single section 380 provision is more consolidated but interpreted broadly.';
    }

    /* Sexual offenses */
    if (query.includes('sexual') || query.includes('rape') || query.includes('consent')) {
        return 'Canada has developed a comprehensive statutory framework for sexual offenses under sections 271-273 of the Criminal Code, emphasizing affirmative consent. Consent must be voluntary, given by a person with the capacity to consent, and cannot be obtained through the abuse of a position of trust, power, or authority. The Criminal Code explicitly states that consent is not obtained where the complainant is incapable of consenting, the accused induces consent by abusing a position of trust, the complainant expresses lack of agreement, or the complainant, having initially consented, expresses withdrawal of consent (s.273.1). The Supreme Court of Canada in R. v. Ewanchuk (1999) held that there is no defense of implied consent in Canadian law. In the United States, sexual offense laws vary significantly by state. Many states have moved from the traditional common-law focus on force and resistance to consent-based frameworks, though the degree and specifics of this shift vary. Some states have adopted affirmative consent standards, while others still require proof of force or threat. The MPC\'s sexual offense provisions underwent a major revision process, modernizing definitions that dated back to the 1962 code. Federal law under 18 U.S.C. sections 2241-2248 covers sexual abuse in federal jurisdictions with graduated offenses based on force, incapacitation, and age of the victim.';
    }

    /* Cybercrime */
    if (query.includes('cyber') || query.includes('computer') || query.includes('hack') || query.includes('online') || query.includes('internet crime') || query.includes('digital')) {
        return 'In Canada, cybercrime offenses are addressed through several Criminal Code provisions, including unauthorized use of a computer (s.342.1), mischief in relation to computer data (s.430(1.1)), and the interception of private communications (s.184). The Criminal Code also addresses child exploitation material (s.163.1), non-consensual distribution of intimate images (s.162.1), and identity theft/fraud (ss.402.2, 403). Canada is a signatory to the Budapest Convention on Cybercrime, which facilitates international cooperation in investigations and prosecutions. In the United States, the Computer Fraud and Abuse Act (CFAA, 18 U.S.C. section 1030) is the primary federal cybercrime statute, criminalizing unauthorized access to computers and computer systems, with penalties ranging from 1 to 20 years depending on the offense and whether it involves protected computers, government systems, or results in damage. The Electronic Communications Privacy Act (ECPA) and the Stored Communications Act govern interception and access to electronic communications. Federal prosecutors also frequently use wire fraud and identity theft statutes to address cyber-enabled crimes. The U.S. has a broader array of specialized federal cybercrime statutes compared to Canada, though both countries face similar challenges in cross-border jurisdiction and evidence gathering in the digital context.';
    }

    /* Appeals */
    if (query.includes('appeal') || query.includes('review') || query.includes('overturn') || query.includes('higher court')) {
        return 'In Canada, the appeals process for indictable offenses flows from the trial court to the provincial or territorial Court of Appeal (Criminal Code ss.675-696), and then to the Supreme Court of Canada with leave. Appeals can be brought on questions of law as of right, but appeals on questions of fact or mixed fact and law require leave from the appellate court. The standard of review for questions of law is correctness, while findings of fact are reviewed for palpable and overriding error. A unique Canadian mechanism is the Ministerial Review process (s.696.1-696.6), which allows the federal Minister of Justice to refer cases back for review when there is a reasonable basis to conclude that a miscarriage of justice likely occurred. In the United States, defendants convicted in state courts appeal first to the state appellate courts, then may seek discretionary review from the state supreme court, and finally may petition for certiorari to the U.S. Supreme Court on federal constitutional questions. Federal convictions are appealed to the Circuit Courts of Appeals and then to the Supreme Court. Habeas corpus proceedings (28 U.S.C. section 2254 for state prisoners and section 2255 for federal prisoners) provide an additional avenue for challenging the constitutionality of a conviction or sentence after direct appeal has been exhausted. The Antiterrorism and Effective Death Penalty Act (AEDPA) of 1996 significantly restricted the scope and availability of federal habeas review.';
    }

    /* Default / Unrecognized */
    return 'Thank you for your question. I am the Kimuntu Legal AI demo assistant, specializing in comparative criminal law between Canada and the United States. I can provide detailed information on a wide range of topics including: offense elements (theft, assault, murder, fraud, sexual offenses, drug offenses, cybercrime), procedural rights (bail, search and seizure, right to counsel, appeals), defenses (self-defense, necessity, duress), sentencing frameworks, and youth justice. Try asking me about a specific topic such as "Compare theft laws in Canada vs US," "Explain self-defense standards," or "How does bail work?" and I will provide a detailed comparative analysis with statutory references.';
};

/* ------------------------------------------------------------------ */
/*  Helper: format time for message timestamps                         */
/* ------------------------------------------------------------------ */
const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
};

/* ------------------------------------------------------------------ */
/*  Typing indicator component (three bouncing dots)                   */
/* ------------------------------------------------------------------ */
const TypingIndicator = ({ isDark }) => (
    <div className="flex items-start gap-3 animate-fade-in">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-white" />
        </div>
        <div className={`px-4 py-3 rounded-2xl rounded-tl-sm backdrop-blur-xl border ${isDark
            ? 'bg-white/10 border-white/10'
            : 'bg-white border-gray-200'
            }`}>
            <div className="flex items-center gap-1.5 h-5">
                {[0, 1, 2].map((i) => (
                    <span
                        key={i}
                        className={`w-2 h-2 rounded-full ${isDark ? 'bg-purple-300' : 'bg-purple-500'}`}
                        style={{
                            animation: 'bounce-dot 1.4s ease-in-out infinite',
                            animationDelay: `${i * 0.2}s`,
                        }}
                    />
                ))}
            </div>
        </div>
    </div>
);

/* ------------------------------------------------------------------ */
/*  Message bubble component                                           */
/* ------------------------------------------------------------------ */
const MessageBubble = ({ message, isDark, isLatestAssistant }) => {
    const isUser = message.role === 'user';
    const shouldStream = !isUser && isLatestAssistant && message._stream;
    const { displayedText, isDone } = useStreamingText(message.content, shouldStream, 18);
    const textToShow = shouldStream ? displayedText : message.content;

    return (
        <div
            className={`flex items-start gap-3 animate-fade-in ${isUser ? 'flex-row-reverse' : ''}`}
        >
            {/* Avatar */}
            {!isUser && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                </div>
            )}

            {/* Bubble */}
            <div className={`max-w-[80%] sm:max-w-[75%]`}>
                <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${isUser
                        ? 'rounded-tr-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : isDark
                            ? 'rounded-tl-sm bg-white/10 backdrop-blur-xl border border-white/10 text-gray-200'
                            : 'rounded-tl-sm bg-white backdrop-blur-xl border border-gray-200 text-gray-800'
                        }`}
                >
                    {textToShow}
                    {shouldStream && !isDone && (
                        <span className="inline-block w-0.5 h-4 ml-0.5 align-middle bg-current animate-pulse" />
                    )}
                </div>
                <p className={`text-[10px] mt-1 ${isUser ? 'text-right' : 'text-left'} ${isDark ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                    {formatTime(message.timestamp)}
                </p>
            </div>

            {/* User avatar */}
            {isUser && (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${isDark
                    ? 'bg-white/20 text-white'
                    : 'bg-purple-100 text-purple-700'
                    }`}>
                    U
                </div>
            )}
        </div>
    );
};

/* ------------------------------------------------------------------ */
/*  Main Chat component                                                */
/* ------------------------------------------------------------------ */
const Chat = () => {
    const { isDark } = useTheme();
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [infoOpen, setInfoOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content:
                'Welcome to the Kimuntu Legal AI demo. I can help you explore and compare criminal law concepts between Canada and the United States. Ask me about offense elements, procedural rights, defenses, sentencing, or any other criminal law topic. Try one of the suggested prompts below to get started.',
            timestamp: new Date(),
        },
    ]);

    const chatContainerRef = useRef(null);
    const inputRef = useRef(null);

    /* Scroll to bottom of the chat CONTAINER only (not the page) */
    const scrollToBottom = useCallback(() => {
        const container = chatContainerRef.current;
        if (container) {
            requestAnimationFrame(() => {
                container.scrollTo({
                    top: container.scrollHeight,
                    behavior: 'smooth',
                });
            });
        }
    }, []);

    /* Auto-scroll within container on new messages or typing change */
    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, scrollToBottom]);

    /* Send a message */
    const handleSend = useCallback(() => {
        const trimmed = input.trim();
        if (!trimmed || isTyping) return;

        const userMessage = { role: 'user', content: trimmed, timestamp: new Date() };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        /* Random delay between 800ms - 1500ms for "thinking" */
        const delay = 800 + Math.random() * 700;

        setTimeout(() => {
            const assistantMessage = {
                role: 'assistant',
                content: buildDemoResponse(trimmed),
                timestamp: new Date(),
                _stream: true, // flag to enable streaming animation
            };
            setMessages((prev) => [...prev, assistantMessage]);
            setIsTyping(false);
        }, delay);
    }, [input, isTyping]);

    /* Clear chat */
    const handleClear = () => {
        setMessages([
            {
                role: 'assistant',
                content:
                    'Chat cleared. I am ready to help with your criminal law questions. Feel free to ask about any topic or use the suggested prompts below.',
                timestamp: new Date(),
            },
        ]);
        setInput('');
        setIsTyping(false);
    };

    /* Use a starter prompt */
    const handleStarterClick = (prompt) => {
        if (isTyping) return;
        setInput(prompt);
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    const messageCount = messages.length;

    return (
        <PageWrapper title="Legal AI Chat">
            {/* Keyframe animation styles */}
            <style jsx global>{`
                @keyframes bounce-dot {
                    0%, 60%, 100% { transform: translateY(0); }
                    30% { transform: translateY(-6px); }
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse-cursor {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
                .animate-pulse {
                    animation: pulse-cursor 0.8s ease-in-out infinite;
                }
            `}</style>

            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                {/* ---- Top Bar ---- */}
                <div className={`flex items-center justify-between p-4 rounded-2xl mb-4 border backdrop-blur-xl ${isDark
                    ? 'bg-white/5 border-white/10'
                    : 'bg-white/60 border-gray-200'
                    }`}>
                    {/* Left: assistant identity */}
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            {/* Online status dot */}
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-900" />
                        </div>
                        <div>
                            <h2 className={`text-base font-semibold leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Kimuntu Legal AI
                            </h2>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 align-middle" />
                                Online
                            </p>
                        </div>
                    </div>

                    {/* Right: badges & clear */}
                    <div className="flex items-center gap-3">
                        {/* Demo badge */}
                        <span className={`hidden sm:inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium ${isDark
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-purple-50 text-purple-600 border border-purple-200'
                            }`}>
                            <Sparkles className="w-3 h-3" />
                            Demo Mode
                        </span>

                        {/* Message count */}
                        <span className={`hidden sm:inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full ${isDark
                            ? 'bg-white/10 text-gray-300'
                            : 'bg-gray-100 text-gray-600'
                            }`}>
                            <MessageSquare className="w-3 h-3" />
                            {messageCount}
                        </span>

                        {/* Clear button */}
                        <button
                            onClick={handleClear}
                            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all ${isDark
                                ? 'bg-white/10 hover:bg-white/20 text-gray-300'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                                }`}
                            title="Clear chat"
                        >
                            <RotateCcw className="w-3 h-3" />
                            <span className="hidden sm:inline">Clear</span>
                        </button>
                    </div>
                </div>

                {/* ---- Chat area ---- */}
                <div
                    ref={chatContainerRef}
                    className={`h-[55vh] sm:h-[50vh] md:h-[55vh] overflow-y-auto p-4 sm:p-6 rounded-2xl border backdrop-blur-xl ${isDark
                        ? 'bg-black/20 border-white/10'
                        : 'bg-white/40 border-gray-200'
                        }`}
                >
                    <div className="space-y-5">
                        {messages.map((message, index) => {
                            /* Find if this is the latest assistant message (for streaming) */
                            const isLatestAssistant = message.role === 'assistant' && index === messages.length - 1;
                            return (
                                <MessageBubble
                                    key={index}
                                    message={message}
                                    isDark={isDark}
                                    isLatestAssistant={isLatestAssistant}
                                />
                            );
                        })}
                        {isTyping && <TypingIndicator isDark={isDark} />}
                    </div>
                </div>

                {/* ---- Starter prompts (horizontally scrollable) ---- */}
                <div className="mt-4 mb-3">
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {starterPrompts.map((prompt, index) => (
                            <button
                                key={index}
                                onClick={() => handleStarterClick(prompt)}
                                disabled={isTyping}
                                className={`flex-shrink-0 text-xs px-3.5 py-2 rounded-full border transition-all whitespace-nowrap ${isTyping
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:scale-[1.02] active:scale-[0.98]'
                                    } ${isDark
                                        ? 'border-white/10 text-gray-300 hover:bg-white/10 hover:border-purple-500/40'
                                        : 'border-gray-300 text-gray-600 hover:bg-purple-50 hover:border-purple-300'
                                    }`}
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ---- Input area ---- */}
                <div className={`flex items-center gap-3 p-3 rounded-2xl border backdrop-blur-xl ${isDark
                    ? 'bg-white/5 border-white/10'
                    : 'bg-white/60 border-gray-200'
                    }`}>
                    <input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Ask about criminal law..."
                        disabled={isTyping}
                        className={`flex-1 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${isDark
                            ? 'bg-white/10 text-white border border-white/10 placeholder:text-gray-500'
                            : 'bg-white text-gray-900 border border-gray-200 placeholder:text-gray-400'
                            } ${isTyping ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping}
                        className={`px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white transition-all flex items-center justify-center ${!input.trim() || isTyping
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:from-purple-600 hover:to-pink-600 hover:shadow-lg hover:shadow-purple-500/25 active:scale-95'
                            }`}
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>

                {/* ---- Collapsible info panel ---- */}
                <div className={`mt-4 rounded-2xl border backdrop-blur-xl overflow-hidden transition-all ${isDark
                    ? 'bg-white/5 border-white/10'
                    : 'bg-white/60 border-gray-200'
                    }`}>
                    <button
                        onClick={() => setInfoOpen(!infoOpen)}
                        className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors ${isDark
                            ? 'text-gray-300 hover:bg-white/5'
                            : 'text-gray-600 hover:bg-white/40'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <ShieldAlert className={`w-4 h-4 ${isDark ? 'text-yellow-300' : 'text-yellow-600'}`} />
                            <span>About this demo</span>
                        </div>
                        {infoOpen ? (
                            <ChevronUp className="w-4 h-4" />
                        ) : (
                            <ChevronDown className="w-4 h-4" />
                        )}
                    </button>

                    {infoOpen && (
                        <div className={`px-4 pb-4 space-y-3 animate-fade-in`}>
                            {/* Disclaimer */}
                            <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Demo mode - responses are pre-built examples for illustrative purposes only.
                                This is not legal advice. Always consult qualified counsel for real cases.
                            </p>

                            {/* Knowledge sources */}
                            <div className={`p-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/70 border-gray-200'}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Database className={`w-3.5 h-3.5 ${isDark ? 'text-purple-300' : 'text-purple-600'}`} />
                                    <span className="text-xs font-medium">Knowledge Sources</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        'Canada Criminal Code',
                                        'Canadian Charter of Rights',
                                        'U.S. Federal Statutes',
                                        'Model Penal Code',
                                        'State Criminal Codes',
                                        'Case Law Summaries',
                                    ].map((source) => (
                                        <span
                                            key={source}
                                            className={`text-[10px] px-2 py-1 rounded-full ${isDark
                                                ? 'bg-purple-500/15 text-purple-300 border border-purple-500/20'
                                                : 'bg-purple-50 text-purple-600 border border-purple-100'
                                                }`}
                                        >
                                            {source}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Link to research */}
                            <div className="flex items-center gap-4">
                                <Link
                                    href="/research"
                                    className={`inline-flex items-center gap-1.5 text-xs font-medium transition-colors ${isDark
                                        ? 'text-purple-300 hover:text-purple-200'
                                        : 'text-purple-600 hover:text-purple-700'
                                        }`}
                                >
                                    <BookOpen className="w-3.5 h-3.5" />
                                    Explore the research database
                                    <ExternalLink className="w-3 h-3" />
                                </Link>

                                <span className={`inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full ${isDark
                                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
                                    : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                    }`}>
                                    <Scale className="w-3 h-3" />
                                    Comparative Criminal Law
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PageWrapper>
    );
};

export default Chat;
