'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAvatar } from '@/components/avatar/AvatarContext'
import PersonAvatar from '@/components/avatar/PersonAvatar'

const STATE_LIST = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming',
]

const STATE_ABBREVIATIONS = {
  AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',CO:'Colorado',CT:'Connecticut',DE:'Delaware',FL:'Florida',GA:'Georgia',HI:'Hawaii',ID:'Idaho',IL:'Illinois',IN:'Indiana',IA:'Iowa',KS:'Kansas',KY:'Kentucky',LA:'Louisiana',ME:'Maine',MD:'Maryland',MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',MS:'Mississippi',MO:'Missouri',MT:'Montana',NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',NJ:'New Jersey',NM:'New Mexico',NY:'New York',NC:'North Carolina',ND:'North Dakota',OH:'Ohio',OK:'Oklahoma',OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',SD:'South Dakota',TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',VA:'Virginia',WA:'Washington',WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming',
}

const STATE_NAME_MAP = STATE_LIST.reduce((acc, state) => {
  acc[state.toLowerCase()] = state
  return acc
}, {})

Object.entries(STATE_ABBREVIATIONS).forEach(([abbr, state]) => {
  STATE_NAME_MAP[abbr.toLowerCase()] = state
})

const STATE_KEYWORDS = Object.keys(STATE_NAME_MAP)

const COMMUNITY_PROPERTY_STATES = new Set([
  'Arizona','California','Idaho','Louisiana','Nevada','New Mexico','Texas','Washington','Wisconsin','Alaska',
])

function detectUSState(lowerQuestion) {
  for (const keyword of STATE_KEYWORDS) {
    if (lowerQuestion.includes(keyword)) {
      return STATE_NAME_MAP[keyword]
    }
  }
  return null
}

function createDefaultStateSummary(state) {
  const slug = state.toLowerCase().replace(/\s+/g, '-')
  const propertyLine = COMMUNITY_PROPERTY_STATES.has(state)
    ? `${state} is a community-property jurisdiction. Marital assets and debts acquired during marriage are generally presumed to be owned by both spouses equally, although courts can deviate for fairness.`
    : `${state} uses an equitable-distribution framework. Courts divide marital assets and debts in a manner that is fair (not necessarily 50/50) after analyzing contributions, economic circumstances, and statutory factors.`

  return {
    summary: `${state} allows no-fault divorce based on an “irretrievable breakdown” or similar standard, while some fault grounds may still exist. Residency requirements typically range from 6 months to 1 year (verify with local statutes). ${propertyLine} Parenting plans and custody orders rely on the “best interests of the child” standard, considering safety, stability, and parental involvement. Child support follows state guidelines that weigh each parent’s income, parenting time, health insurance, and special expenses. Spousal support (alimony/maintenance) depends on marriage length, financial need, and statutory factors.`,
    highlights: [
      `Residency: Most divorces filed in ${state} require living in the state for several months (often 6+) before filing; some counties add shorter local requirements.`,
      `Property Division: ${COMMUNITY_PROPERTY_STATES.has(state) ? 'Community-property (equal ownership of marital assets)' : 'Equitable-distribution (fair but not always equal split)'} principles control how assets/debts are divided.`,
      `Custody: ${state} courts apply the best-interests-of-the-child standard and typically require detailed parenting plans or time-sharing schedules.`,
      `Support: Child support follows statewide formulas; spousal support considers length of marriage, need, and ability to pay.`,
    ],
    sources: [
      {
        title: `${state} Statutes (Justia)`,
        url: `https://law.justia.com/codes/${slug}/`,
        snippet: `Browse ${state} statutes, including domestic relations and family law provisions.`,
      },
      {
        title: `${state} Family Law Overview (FindLaw)`,
        url: `https://statelaws.findlaw.com/${slug}-law/${slug}-family-law.html`,
        snippet: `Summary of family law topics, divorce, custody, and support in ${state}.`,
      },
    ],
  }
}

const STATE_FAMILY_LAW_SUMMARIES = {
  California: {
    summary:
      'California is a community-property, no-fault divorce state. Couples must meet a 6-month residency requirement and can cite “irreconcilable differences” as grounds. Mandatory disclosures of all assets/debts are required. The state uses guidelines such as the California Child Support Formula (Fam. Code § 4055) and applies the “best interests” test for custody. Spousal support considers the factors in Fam. Code § 4320.',
    highlights: [
      'Residency: 6 months in California, 3 months in filing county (Fam. Code § 2320)',
      'Waiting Period: Minimum 6 months after service before divorce can finalize',
      'Community Property: Assets acquired during marriage are generally split 50/50',
      'Custody: Best interests factors (Fam. Code §§ 3011, 3020) with emphasis on frequent/continuous contact',
    ],
    sources: [
      {
        title: 'California Courts – Divorce or Separation',
        url: 'https://selfhelp.courts.ca.gov/divorce',
        snippet: 'Official California Courts self-help guide for divorce and legal separation.',
      },
      {
        title: 'California Family Code',
        url: 'https://leginfo.legislature.ca.gov/faces/codesTOCSelected.xhtml?tocCode=FAM',
        snippet: 'Statutory text covering divorce, custody, and support.',
      },
    ],
  },
  Washington: {
    summary:
      'Washington is a community-property, no-fault state. Any spouse may file by asserting the marriage is “irretrievably broken.” The court divides property “as just and equitable,” which can depart from 50/50. Parenting plans govern custody and residential schedules. Child support follows the Washington State Child Support Schedule.',
    highlights: [
      'Residency: One spouse must live in Washington or be stationed there (RCW 26.09.030)',
      'Property: Equitable distribution based on community/separate property analysis',
      'Parenting Plans: Required, focusing on decision-making and residential schedules',
      'Support: Uses Washington Child Support Economic Table (RCW 26.19)',
    ],
    sources: [
      {
        title: 'Washington Courts – Divorce',
        url: 'https://www.courts.wa.gov/selfhelp/?fa=selfhelp.divorce',
        snippet: 'State court self-help resources for dissolutions.',
      },
      {
        title: 'RCW Title 26 – Domestic Relations',
        url: 'https://app.leg.wa.gov/RCW/default.aspx?cite=26',
        snippet: 'Washington statutes governing dissolution, custody, and support.',
      },
    ],
  },
  Oregon: {
    summary:
      'Oregon permits no-fault dissolution based on “irreconcilable differences.” It follows equitable distribution (not community property). The court divides marital assets fairly, not necessarily equally. Parenting plans are required, and custody is determined by the child’s best interests. Child support follows the Oregon Child Support Guidelines.',
    highlights: [
      'Residency: One spouse must live in Oregon for 6 months before filing (ORS 107.075)',
      'Property: Fair/equitable distribution considering contributions, homemaking, earning capacity',
      'Custody: Best interests factors (ORS 107.137) emphasizing safety and caregiver relationships',
      'Support: Oregon Child Support Calculator (administered by DCSS)',
    ],
    sources: [
      {
        title: 'Oregon Judicial Department – Divorce',
        url: 'https://www.courts.oregon.gov/services/online/Pages/divorce.aspx',
        snippet: 'Forms and instructions for dissolution in Oregon.',
      },
      {
        title: 'Oregon Revised Statutes – Chapter 107',
        url: 'https://www.oregonlegislature.gov/bills_laws/ors/ors107.html',
        snippet: 'Statutes covering marriage dissolution, custody, and support.',
      },
    ],
  },
  Texas: {
    summary:
      'Texas is a community-property state allowing both no-fault and fault-based divorces. Residency requires 6 months in the state and 90 days in the county. Community property is divided in a “just and right” manner. Child custody is referred to as conservatorship, with joint managing conservators favored. Child support follows percentage guidelines.',
    highlights: [
      'Residency: 6 months in Texas, 90 days in county (Tex. Fam. Code § 6.301)',
      'Property: “Just and right” division of community property (Tex. Fam. Code § 7.001)',
      'Custody: Conservatorship with best interests standard (Tex. Fam. Code § 153.002)',
      'Support: Percentage of obligor’s net resources (Tex. Fam. Code Chapter 154)',
    ],
    sources: [
      {
        title: 'TexasLawHelp – Divorce Overview',
        url: 'https://texaslawhelp.org/topic/divorce',
        snippet: 'Guides and forms for Texas divorce and custody.',
      },
      {
        title: 'Texas Family Code',
        url: 'https://statutes.capitol.texas.gov/?link=FA',
        snippet: 'Official statutes covering divorce, custody, and support in Texas.',
      },
    ],
  },
  Florida: {
    summary:
      'Florida is an equitable-distribution, no-fault state. Residency requires 6 months before filing. Equitable distribution considers contributions, economic circumstances, and duration of marriage. Parenting plans are mandatory, and time-sharing is based on the child’s best interests. Child support uses the Florida Child Support Guidelines Worksheet.',
    highlights: [
      'Residency: 6 months prior to filing (Fla. Stat. § 61.021)',
      'Property: Equitable distribution under Fla. Stat. § 61.075',
      'Parenting Plan: Required in every case (Fla. Stat. § 61.13)',
      'Support: Guidelines under Fla. Stat. § 61.30 using income shares model',
    ],
    sources: [
      {
        title: 'Florida Courts – Family Law Forms',
        url: 'https://www.flcourts.gov/Resources-Services/Court-Improvement/Family-Courts/Family-Law-Forms',
        snippet: 'Approved family law forms and instructions.',
      },
      {
        title: 'Florida Statutes – Chapter 61',
        url: 'https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0000-0099/0061/0061.html',
        snippet: 'Statutory framework for dissolution, custody, and support.',
      },
    ],
  },
}

export default function WebDemo() {
  const [activeTab, setActiveTab] = useState('overview')
  const [activeAI, setActiveAI] = useState('canada') // 'canada' or 'us'
  const [chatInput, setChatInput] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme')
      return saved ? saved === 'dark' : true
    }
    return true
  })
  const chatMessagesRef = useRef(null)
  const { settings } = useAvatar()
  const userAvatar = settings.user
  const canadaAiAvatar = settings.canada
  const usAiAvatar = settings.us

  const toggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme ? 'dark' : 'light')
    }
  }
  
  // Separate message histories for each AI
  const [canadaMessages, setCanadaMessages] = useState([
    {
      type: 'ai',
      text: "Hello! I'm your Canada Family Law AI Assistant. I specialize in Canadian family law including divorce, custody, support, and property division across all provinces and territories. What would you like to know?",
      sources: [],
      timestamp: new Date().toISOString()
    }
  ])
  const [usMessages, setUsMessages] = useState([
    {
      type: 'ai',
      text: "Hello! I'm your US Family Law AI Assistant. I specialize in United States family law including divorce, custody, support, and property division across all 50 states. What would you like to know?",
      sources: [],
      timestamp: new Date().toISOString()
    }
  ])
  
  // Get current messages based on active AI
  const messages = activeAI === 'canada' ? canadaMessages : usMessages
  const aiAvatar = activeAI === 'canada' ? canadaAiAvatar : usAiAvatar

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight
    }
  }, [messages])

  const showTab = (tabName, aiType = null) => {
    setActiveTab(tabName)
    if (aiType && (aiType === 'canada' || aiType === 'us')) {
      setActiveAI(aiType)
    }
  }

  const getAIResponse = (question, jurisdiction) => {
    const lowerQuestion = question.toLowerCase()
    let response = ''
    let sources = []

    // Detect topic
    const isDivorce = lowerQuestion.includes('divorce') || lowerQuestion.includes('dissolution')
    const isCustody = lowerQuestion.includes('custody') || lowerQuestion.includes('visitation') || lowerQuestion.includes('parenting time')
    const isSupport = lowerQuestion.includes('support') || lowerQuestion.includes('alimony') || lowerQuestion.includes('spousal support') || lowerQuestion.includes('child support')
    const isProperty = lowerQuestion.includes('property') || lowerQuestion.includes('asset') || lowerQuestion.includes('division') || lowerQuestion.includes('marital property')

    // Canada-specific responses
    if (jurisdiction === 'canada') {
      if (isDivorce) {
        response = "In Canada, divorce is governed by the federal Divorce Act. To file for divorce, you must: (1) Meet residency requirements (at least one spouse must have lived in Canada for at least one year before filing), (2) Establish grounds for divorce (separation for at least one year, adultery, or physical/mental cruelty), (3) File an application with the appropriate provincial court, and (4) Resolve corollary issues like child custody, support, and property division. The most common ground is one year of separation. The process typically involves filing documents, serving the other party, and may require mediation or court proceedings. Property division is governed by provincial law, which varies by province."
        sources = [
          { 
            type: 'legal', 
            title: 'Divorce Act (Canada)', 
            url: 'https://laws-lois.justice.gc.ca/eng/acts/d-3.4/', 
            snippet: 'Section 8(2)(a) - Grounds for divorce' 
          },
          { 
            type: 'legal', 
            title: 'Justice Canada - Divorce', 
            url: 'https://www.justice.gc.ca/eng/fl-df/divorce/', 
            snippet: 'Federal divorce procedures and requirements' 
          },
          { 
            type: 'legal', 
            title: 'Ontario Family Law Act', 
            url: 'https://www.ontario.ca/laws/statute/90f03', 
            snippet: 'Provincial family law and property division' 
          }
        ]
      } else if (isCustody) {
        response = "In Canada, child custody is determined by provincial courts using the 'best interests of the child' standard. Factors considered include: (1) The child's needs and best interests, (2) The child's relationship with each parent, (3) Each parent's ability to care for the child, (4) The child's views and preferences (if age-appropriate), (5) History of family violence, and (6) Each parent's willingness to support the child's relationship with the other parent. Canadian law distinguishes between custody (decision-making authority) and access (parenting time). The Divorce Act governs custody for married couples, while provincial legislation applies to unmarried couples. Courts generally prefer arrangements that maintain meaningful relationships with both parents when safe and appropriate."
        sources = [
          { 
            type: 'legal', 
            title: 'Divorce Act (Canada) - Custody and Access', 
            url: 'https://laws-lois.justice.gc.ca/eng/acts/d-3.4/page-1.html', 
            snippet: 'Federal custody and access provisions' 
          },
          { 
            type: 'legal', 
            title: 'Justice Canada - Child Custody and Access', 
            url: 'https://www.justice.gc.ca/eng/fl-df/divorce/custody-garde.html', 
            snippet: 'Best interests of the child standard in Canada' 
          }
        ]
      } else if (isSupport) {
        response = "In Canada, child support is calculated using the Federal Child Support Guidelines, which provide tables based on the paying parent's income and the number of children. The guidelines consider: (1) The paying parent's gross income, (2) The number of children, (3) The province or territory, and (4) Special expenses (child care, post-secondary education, extraordinary expenses). Spousal support is calculated separately using the Spousal Support Advisory Guidelines, considering factors like marriage length, income disparity, and roles during marriage. Support amounts can be adjusted based on shared custody arrangements or special circumstances. The guidelines are used nationwide, though provincial legislation may apply in some cases."
        sources = [
          { 
            type: 'legal', 
            title: 'Federal Child Support Guidelines (Canada)', 
            url: 'https://www.justice.gc.ca/eng/fl-df/child-enfant/look-rech.asp', 
            snippet: 'Official child support calculation tables' 
          },
          { 
            type: 'legal', 
            title: 'Spousal Support Advisory Guidelines', 
            url: 'https://www.justice.gc.ca/eng/fl-df/spousal-epoux/ssag-ldfpae.html', 
            snippet: 'Spousal support calculation guidelines' 
          }
        ]
      } else if (isProperty) {
        response = "In Canada, property division is governed by provincial law, which varies significantly. Most provinces follow an 'equalization' or 'net family property' approach: (1) Calculate each spouse's net worth at marriage and at separation, (2) Determine the difference (equalization payment), and (3) The spouse with greater net worth pays half the difference to the other. Some provinces (like Quebec) follow different rules. Excluded property typically includes: gifts, inheritances (unless used for family purposes), and property owned before marriage. The Family Law Act in each province governs these rules. It's important to consult provincial-specific legislation as rules differ between provinces."
        sources = [
          { 
            type: 'legal', 
            title: 'Ontario Family Law Act - Property Division', 
            url: 'https://www.ontario.ca/laws/statute/90f03', 
            snippet: 'Equalization of net family property in Ontario' 
          },
          { 
            type: 'legal', 
            title: 'Justice Canada - Property Division', 
            url: 'https://www.justice.gc.ca/eng/fl-df/divorce/property-biens.html', 
            snippet: 'Property division rules across Canadian provinces' 
          }
        ]
      } else {
        response = "I can help you with various Canadian family law matters including divorce, custody, support, and property division across all provinces and territories. Please specify the topic you'd like to know about (divorce requirements, child custody, child support, spousal support, property division, etc.) and I'll provide you with accurate information based on Canadian federal and provincial law."
        sources = []
      }
    }
    // US-specific responses
    else if (jurisdiction === 'us') {
      const detectedState = detectUSState(lowerQuestion)
      if (detectedState) {
        const stateInfo = STATE_FAMILY_LAW_SUMMARIES[detectedState] || createDefaultStateSummary(detectedState)
        response = `${detectedState} Family Law Overview:\n${stateInfo.summary}\n\nKey Points:\n${stateInfo.highlights
          .map(point => `• ${point}`)
          .join('\n')}\n\nFor detailed procedures, review the official resources below or consult a licensed attorney in ${detectedState}.`
        sources = stateInfo.sources
      } else if (isDivorce) {
        response = "In the United States, divorce laws vary by state, but generally follow no-fault or fault-based grounds. Most states are 'no-fault' states, meaning you can file for divorce without proving wrongdoing. Common requirements include: (1) Residency requirements (typically 6 months to 1 year in the state), (2) Grounds for divorce (irreconcilable differences, irremediable breakdown, or fault-based grounds like adultery, cruelty, abandonment), (3) Filing a petition with the court, (4) Serving the other party, and (5) Resolving issues like property division, child custody, and support. Some states require a waiting period (often 30-90 days) before the divorce can be finalized. It's important to consult with an attorney in your specific state as laws vary significantly."
        sources = [
          { 
            type: 'legal', 
            title: 'American Bar Association - Divorce Basics', 
            url: 'https://www.americanbar.org/groups/public_education/resources/law_issues_for_consumers/divorce/', 
            snippet: 'Overview of divorce procedures in the United States' 
          },
          { 
            type: 'legal', 
            title: 'FindLaw - Divorce Laws by State', 
            url: 'https://www.findlaw.com/family/divorce/divorce-laws-by-state.html', 
            snippet: 'State-specific divorce requirements and procedures' 
          },
          { 
            type: 'legal', 
            title: 'Nolo - No-Fault Divorce', 
            url: 'https://www.nolo.com/legal-encyclopedia/no-fault-divorce-29561.html', 
            snippet: 'Understanding no-fault divorce laws across US states' 
          }
        ]
      } else if (isCustody) {
        response = "In the United States, child custody is determined by state courts using the 'best interests of the child' standard. Factors considered include: (1) The child's relationship with each parent, (2) Each parent's ability to provide for the child's needs, (3) The child's adjustment to home, school, and community, (4) The mental and physical health of all parties, (5) The child's preferences (if age-appropriate, typically 12+), (6) Evidence of domestic violence or abuse, and (7) Each parent's willingness to facilitate the child's relationship with the other parent. Most states prefer joint custody when both parents are fit, but the specific arrangement (legal custody, physical custody, or both) varies. Custody laws differ significantly by state, so it's crucial to understand your state's specific statutes."
        sources = [
          { 
            type: 'legal', 
            title: 'FindLaw - Child Custody Laws by State', 
            url: 'https://www.findlaw.com/family/child-custody/child-custody-laws-by-state.html', 
            snippet: 'State-specific child custody laws and factors' 
          },
          { 
            type: 'legal', 
            title: 'American Bar Association - Child Custody', 
            url: 'https://www.americanbar.org/groups/public_education/resources/law_issues_for_consumers/childcustody/', 
            snippet: 'Understanding child custody in the United States' 
          },
          { 
            type: 'legal', 
            title: 'Nolo - Child Custody Basics', 
            url: 'https://www.nolo.com/legal-encyclopedia/child-custody-basics-29690.html', 
            snippet: 'Best interests standard and custody types' 
          }
        ]
      } else if (isSupport) {
        response = "In the United States, child support is calculated using state-specific guidelines that consider: (1) Each parent's income and earning capacity, (2) The number of children, (3) Custody arrangement (time spent with each parent), (4) Child care and health insurance costs, and (5) Special needs or expenses. Each state has its own formula - some use percentage of income models, others use income shares models. Spousal support (alimony) is separate and considers factors like marriage duration, each spouse's income and earning capacity, standard of living during marriage, and contributions to the marriage. Support orders can be modified based on changed circumstances. It's essential to use your state's specific guidelines and calculators."
        sources = [
          { 
            type: 'legal', 
            title: 'Office of Child Support Enforcement', 
            url: 'https://www.acf.hhs.gov/css', 
            snippet: 'Federal child support enforcement and state guidelines' 
          },
          { 
            type: 'legal', 
            title: 'FindLaw - Child Support Laws by State', 
            url: 'https://www.findlaw.com/family/child-support/child-support-laws-by-state.html', 
            snippet: 'State-specific child support calculation methods' 
          },
          { 
            type: 'legal', 
            title: 'Nolo - Spousal Support (Alimony)', 
            url: 'https://www.nolo.com/legal-encyclopedia/spousal-support-alimony-29695.html', 
            snippet: 'Understanding spousal support in divorce' 
          }
        ]
      } else if (isProperty) {
        response = "In the United States, property division during divorce follows state law, which varies between 'community property' and 'equitable distribution' states. Community property states (Arizona, California, Idaho, Louisiana, Nevada, New Mexico, Texas, Washington, Wisconsin) generally divide marital property 50/50. Equitable distribution states divide property 'fairly' but not necessarily equally, considering factors like: (1) Length of marriage, (2) Each spouse's contributions (financial and non-financial), (3) Each spouse's earning capacity, (4) Age and health, and (5) Tax consequences. Separate property (owned before marriage or received as gifts/inheritance) typically remains with the original owner. Marital property includes assets acquired during marriage."
        sources = [
          { 
            type: 'legal', 
            title: 'FindLaw - Property Division in Divorce', 
            url: 'https://www.findlaw.com/family/divorce/property-division-in-divorce.html', 
            snippet: 'Understanding property division laws by state' 
          },
          { 
            type: 'legal', 
            title: 'Nolo - Dividing Property in Divorce', 
            url: 'https://www.nolo.com/legal-encyclopedia/property-division-divorce-29697.html', 
            snippet: 'Community property vs equitable distribution' 
          }
        ]
      } else {
        response = "I can help you with various United States family law matters including divorce, custody, support, and property division across all 50 states. Please specify the topic you'd like to know about (divorce requirements, child custody, child support, spousal support, property division, etc.) and I'll provide you with accurate information based on US federal and state-specific laws."
        sources = []
      }
    }

    return { response, sources }
  }

  const askAI = (question, jurisdiction = null) => {
    const targetJurisdiction = jurisdiction || activeAI
    showTab('ai-assistant', targetJurisdiction)
    
    const userMessage = { 
      type: 'user', 
      text: question,
      timestamp: new Date().toISOString()
    }
    
    if (targetJurisdiction === 'canada') {
      setCanadaMessages(prev => [...prev, userMessage])
    } else {
      setUsMessages(prev => [...prev, userMessage])
    }
    
    setTimeout(() => {
      const { response, sources } = getAIResponse(question, targetJurisdiction)
      const aiMessage = { 
        type: 'ai', 
        text: response,
        sources: sources,
        timestamp: new Date().toISOString()
      }
      
      if (targetJurisdiction === 'canada') {
        setCanadaMessages(prev => [...prev, aiMessage])
      } else {
        setUsMessages(prev => [...prev, aiMessage])
      }
    }, 1000)
  }

  const sendMessage = () => {
    if (chatInput.trim()) {
      askAI(chatInput, activeAI)
      setChatInput('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage()
    }
  }

  const openCalculator = (type) => {
    const messages = {
      'child-support': 'Child Support Calculator opened! Enter your income and custody arrangement to calculate support payments.',
      'documents': 'Document Generator launched! Select the type of legal document you need to create.',
      'timeline': 'Case Timeline displayed! View important dates and deadlines for your legal matter.',
      'research': 'Legal Research tool activated! Search through case law and legal precedents.'
    }
    alert(messages[type] || 'Tool opened successfully!')
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'legal', label: 'Legal Track' },
    { id: 'ai-assistant', label: 'AI Assistant' },
    { id: 'tools', label: 'Legal Tools' }
  ]

  return (
    <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-black' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${isDarkMode ? 'bg-black/80' : 'bg-white/90'} backdrop-blur-2xl border ${isDarkMode ? 'border-emerald-500/20' : 'border-emerald-600/30'} rounded-3xl p-8 mb-8 shadow-2xl ${isDarkMode ? 'shadow-emerald-500/10' : 'shadow-emerald-500/20'}`}>
          <div className="text-center relative">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`absolute top-0 right-0 px-4 py-2 rounded-xl font-medium transition-all bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-400 hover:to-teal-400 hover:shadow-lg hover:shadow-emerald-500/50 flex items-center gap-2`}
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  <span>Dark Mode</span>
                </>
              )}
            </button>
            <div a className="flex justify-center mb-8">
              <Image
                src="/kimuntu_logo_black.png"
                alt="Kimuntu ProLaunch AI logo"
                width={320}
                height={320}
                priority
                className="w-64 h-auto drop-shadow-[0_10px_40px_rgba(16,185,129,0.35)]"
              />
            </div>
            <h1 className="text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                KimuntuPro AI
              </span>
            </h1>
            <p className={`text-xl mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Powered Platform for Career, Business, and Legal Assistance</p>
            
            {/* Navigation Tabs */}
            <div className="flex flex-wrap justify-center gap-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => showTab(tab.id)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
                      : isDarkMode
                        ? 'bg-gradient-to-r from-emerald-900/60 to-teal-900/30 text-emerald-200 border border-emerald-500/40 hover:from-emerald-600/70 hover:to-teal-500/50 hover:text-white'
                        : 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border border-emerald-500/40 hover:from-emerald-400 hover:to-teal-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={`${isDarkMode ? 'bg-black/80' : 'bg-white/90'} backdrop-blur-2xl border ${isDarkMode ? 'border-emerald-500/20' : 'border-emerald-600/30'} rounded-3xl p-8 shadow-2xl ${isDarkMode ? 'shadow-emerald-500/10' : 'shadow-emerald-500/20'}`}>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <div className="mb-10">
                <h2 className={`text-4xl font-bold mb-8 border-b ${isDarkMode ? 'text-white border-emerald-500/30' : 'text-gray-800 border-emerald-600/40'} pb-4`}>
                  Platform Overview
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className={`${isDarkMode ? 'bg-black/50 border-emerald-500/20 hover:bg-emerald-500/10' : 'bg-gray-50 border-emerald-600/30 hover:bg-emerald-50/50'} border rounded-2xl p-6 transition-all group`}>
                    <div className={`w-12 h-12 ${isDarkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <span className="text-2xl">🎯</span>
                    </div>
                    <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Career Assistance</h3>
                    <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      AI-powered career guidance, resume optimization, and job matching for professional growth.
                    </p>
                    <button
                      onClick={() => showTab('legal')}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg hover:from-emerald-400 hover:to-teal-400 hover:shadow-lg hover:shadow-emerald-500/50 transition-all font-medium"
                    >
                      Explore Features
                    </button>
                  </div>
                  <div className={`${isDarkMode ? 'bg-black/50 border-emerald-500/20 hover:bg-emerald-500/10' : 'bg-gray-50 border-emerald-600/30 hover:bg-emerald-50/50'} border rounded-2xl p-6 transition-all group`}>
                    <div className={`w-12 h-12 ${isDarkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <span className="text-2xl">🏢</span>
                    </div>
                    <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Business Solutions</h3>
                    <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Comprehensive business tools for startups, compliance, and growth management.
                    </p>
                    <button
                      onClick={() => showTab('legal')}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg hover:from-emerald-400 hover:to-teal-400 hover:shadow-lg hover:shadow-emerald-500/50 transition-all font-medium"
                    >
                      View Tools
                    </button>
                  </div>
                  <div className={`${isDarkMode ? 'bg-black/50 border-emerald-500/20 hover:bg-emerald-500/10' : 'bg-gray-50 border-emerald-600/30 hover:bg-emerald-50/50'} border rounded-2xl p-6 transition-all group`}>
                    <div className={`w-12 h-12 ${isDarkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <span className="text-2xl">⚖️</span>
                    </div>
                    <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Legal Track</h3>
                    <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Specialized legal assistance with Family Law AI, document generation, and case management.
                    </p>
                    <button
                      onClick={() => showTab('legal')}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg hover:from-emerald-400 hover:to-teal-400 hover:shadow-lg hover:shadow-emerald-500/50 transition-all font-medium"
                    >
                      Get Started
                    </button>
                  </div>
                </div>
              </div>

              <div className="mb-10">
                <h2 className={`text-4xl font-bold mb-8 border-b ${isDarkMode ? 'text-white border-emerald-500/30' : 'text-gray-800 border-emerald-600/40'} pb-4`}>
                  Key Features
                </h2>
                <ul className="space-y-3">
                  {[
                    'Multilingual Support (English/French)',
                    'AI-Powered Legal Assistant',
                    'Family Law Specialization',
                    'Document Generation Tools',
                    'Case Management System',
                    'Real-time Chat Interface',
                    'Canada & US Legal Coverage',
                    'Secure Data Handling'
                  ].map((feature, i) => (
                    <li key={i} className={`flex items-center text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <span className="text-emerald-400 font-bold mr-3">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Legal Track Tab */}
          {activeTab === 'legal' && (
            <div>
              <h2 className={`text-4xl font-bold mb-8 border-b ${isDarkMode ? 'text-white border-emerald-500/30' : 'text-gray-800 border-emerald-600/40'} pb-4`}>
                Legal Track - Family Law
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`${isDarkMode ? 'bg-black/50 border-emerald-500/20 hover:bg-emerald-500/10' : 'bg-gray-50 border-emerald-600/30 hover:bg-emerald-50/50'} border rounded-2xl p-6 transition-all group`}>
                  <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>🇨🇦 Canada Family Law</h3>
                  <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Comprehensive coverage of Canadian family law including divorce, custody, and support matters.
                  </p>
                  <button
                    onClick={() => {
                      setActiveAI('canada')
                      showTab('ai-assistant', 'canada')
                    }}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg hover:from-emerald-400 hover:to-teal-400 hover:shadow-lg hover:shadow-emerald-500/50 transition-all font-medium"
                  >
                    Open Canada AI
                  </button>
                </div>
                <div className={`${isDarkMode ? 'bg-black/50 border-emerald-500/20 hover:bg-emerald-500/10' : 'bg-gray-50 border-emerald-600/30 hover:bg-emerald-50/50'} border rounded-2xl p-6 transition-all group`}>
                  <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>🇺🇸 US Family Law</h3>
                  <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    US family law guidance covering all 50 states with state-specific information.
                  </p>
                  <button
                    onClick={() => {
                      setActiveAI('us')
                      showTab('ai-assistant', 'us')
                    }}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg hover:from-emerald-400 hover:to-teal-400 hover:shadow-lg hover:shadow-emerald-500/50 transition-all font-medium"
                  >
                    Open US AI
                  </button>
                </div>
                <div className={`${isDarkMode ? 'bg-black/50 border-emerald-500/20 hover:bg-emerald-500/10' : 'bg-gray-50 border-emerald-600/30 hover:bg-emerald-50/50'} border rounded-2xl p-6 transition-all group`}>
                  <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>📋 Document Generation</h3>
                  <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Generate legal documents, forms, and agreements with AI assistance.
                  </p>
                  <button
                    onClick={() => showTab('tools')}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg hover:from-emerald-400 hover:to-teal-400 hover:shadow-lg hover:shadow-emerald-500/50 transition-all font-medium"
                  >
                    View Tools
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* AI Assistant Tab */}
          {activeTab === 'ai-assistant' && (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <PersonAvatar
                    name={activeAI === 'canada' ? 'Canada Law' : 'US Law'}
                    size="lg"
                    color={aiAvatar.color}
                    skinTone={aiAvatar.skinTone}
                    outfitColor={aiAvatar.outfitColor}
                  />
                  <div>
                    <h2 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {activeAI === 'canada' ? 'Canada' : 'United States'} Family Law AI Assistant
                    </h2>
                    <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Enhanced with sources and evidence</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className={`flex gap-2 ${isDarkMode ? 'bg-emerald-900/30 border-emerald-500/30' : 'bg-emerald-100/50 border-emerald-600/40'} border rounded-xl p-1`}>
                    <button
                      onClick={() => setActiveAI('canada')}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        activeAI === 'canada'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-lg shadow-emerald-500/30'
                          : isDarkMode
                            ? 'bg-gradient-to-r from-emerald-900/60 to-teal-900/30 text-emerald-200 hover:from-emerald-500 hover:to-teal-500 hover:text-white'
                            : 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 hover:from-emerald-500 hover:to-teal-500 hover:text-white'
                      }`}
                    >
                      Canada
                    </button>
                    <button
                      onClick={() => setActiveAI('us')}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        activeAI === 'us'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-lg shadow-emerald-500/30'
                          : isDarkMode
                            ? 'bg-gradient-to-r from-emerald-900/60 to-teal-900/30 text-emerald-200 hover:from-emerald-500 hover:to-teal-500 hover:text-white'
                            : 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 hover:from-emerald-500 hover:to-teal-500 hover:text-white'
                      }`}
                    >
                      US
                    </button>
                  </div>
                  <Link
                    href="/dashboard/avatars"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:from-emerald-400 hover:to-teal-400 hover:shadow-lg hover:shadow-emerald-500/40 transition-all"
                  >
                    Customize Avatars
                  </Link>
                </div>
              </div>

              <div className={`${isDarkMode ? 'bg-black/50 border-emerald-500/20' : 'bg-gray-50 border-emerald-600/30'} border rounded-2xl p-6`}>
                <div
                  ref={chatMessagesRef}
                  className={`h-96 overflow-y-auto border ${isDarkMode ? 'border-emerald-500/20 bg-black/30' : 'border-emerald-600/30 bg-white/50'} rounded-xl p-4 mb-4 space-y-4`}
                >
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      {msg.type === 'ai' && (
                        <PersonAvatar
                          name={activeAI === 'canada' ? 'Canada Law' : 'US Law'}
                          size="md"
                          color={aiAvatar.color}
                          skinTone={aiAvatar.skinTone}
                          outfitColor={aiAvatar.outfitColor}
                        />
                      )}
                      {msg.type === 'user' && (
                        <PersonAvatar
                          name="User"
                          size="md"
                          color={userAvatar.color}
                          skinTone={userAvatar.skinTone}
                          outfitColor={userAvatar.outfitColor}
                        />
                      )}
                      <div className={`flex-1 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                        <div
                          className={`inline-block p-4 rounded-xl ${
                            msg.type === 'user'
                              ? isDarkMode
                                ? 'bg-blue-500/20 text-gray-200 border border-blue-500/30'
                                : 'bg-blue-100 text-gray-800 border border-blue-300'
                              : isDarkMode
                                ? 'bg-emerald-500/10 text-gray-200 border border-emerald-500/20'
                                : 'bg-emerald-50 text-gray-800 border border-emerald-300'
                          }`}
                        >
                          <div className={`font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                            {msg.type === 'user' ? 'You' : 'AI Assistant'}
                          </div>
                          <div className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>{msg.text}</div>
                          {msg.sources && msg.sources.length > 0 && (
                            <div className={`mt-3 pt-3 border-t ${isDarkMode ? 'border-emerald-500/20' : 'border-emerald-600/30'}`}>
                              <div className="text-xs font-semibold text-emerald-400 mb-2">Sources & Evidence:</div>
                              <div className="space-y-2">
                                {msg.sources.map((source, idx) => (
                                  <a
                                    key={idx}
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`block text-xs p-2 rounded border transition-all cursor-pointer ${
                                      isDarkMode
                                        ? 'text-gray-400 bg-black/30 border-emerald-500/10 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400'
                                        : 'text-gray-600 bg-white border-emerald-300 hover:bg-emerald-50 hover:border-emerald-500 hover:text-emerald-600'
                                    }`}
                                  >
                                    <div className="font-medium text-emerald-400 hover:underline flex items-center gap-1">
                                      {source.title}
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                      </svg>
                                    </div>
                                    {source.snippet && (
                                      <div className={`mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{source.snippet}</div>
                                    )}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about family law..."
                    className={`flex-1 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 ${
                      isDarkMode
                        ? 'bg-black/50 border-emerald-500/20 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-emerald-500/20'
                        : 'bg-white border-emerald-600/30 text-gray-800 placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500/20'
                    }`}
                  />
                  <button
                    onClick={sendMessage}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl hover:from-emerald-400 hover:to-teal-400 hover:shadow-lg hover:shadow-emerald-500/50 transition-all font-medium"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Legal Tools Tab */}
          {activeTab === 'tools' && (
            <div>
              <h2 className={`text-4xl font-bold mb-8 border-b ${isDarkMode ? 'text-white border-emerald-500/30' : 'text-gray-800 border-emerald-600/40'} pb-4`}>
                Legal Tools & Calculators
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className={`${isDarkMode ? 'bg-black/50 border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-500/10' : 'bg-gray-50 border-emerald-600/30 hover:border-emerald-600/50 hover:bg-emerald-50/50'} border rounded-2xl p-6 transition-all text-center`}>
                  <div className="text-4xl mb-4">💰</div>
                  <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Child Support Calculator</h3>
                  <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Calculate child support payments based on income and jurisdiction.
                  </p>
                  <button
                    onClick={() => openCalculator('child-support')}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg hover:from-emerald-400 hover:to-teal-400 hover:shadow-lg hover:shadow-emerald-500/50 transition-all text-sm font-medium"
                  >
                    Open Calculator
                  </button>
                </div>
                <div className={`${isDarkMode ? 'bg-black/50 border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-500/10' : 'bg-gray-50 border-emerald-600/30 hover:border-emerald-600/50 hover:bg-emerald-50/50'} border rounded-2xl p-6 transition-all text-center`}>
                  <div className="text-4xl mb-4">📄</div>
                  <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Document Generator</h3>
                  <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Generate legal documents and forms automatically.
                  </p>
                  <button
                    onClick={() => openCalculator('documents')}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg hover:from-emerald-400 hover:to-teal-400 hover:shadow-lg hover:shadow-emerald-500/50 transition-all text-sm font-medium"
                  >
                    Generate Document
                  </button>
                </div>
                <div className={`${isDarkMode ? 'bg-black/50 border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-500/10' : 'bg-gray-50 border-emerald-600/30 hover:border-emerald-600/50 hover:bg-emerald-50/50'} border rounded-2xl p-6 transition-all text-center`}>
                  <div className="text-4xl mb-4">📅</div>
                  <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Case Timeline</h3>
                  <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Track important dates and deadlines for your case.
                  </p>
                  <button
                    onClick={() => openCalculator('timeline')}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg hover:from-emerald-400 hover:to-teal-400 hover:shadow-lg hover:shadow-emerald-500/50 transition-all text-sm font-medium"
                  >
                    View Timeline
                  </button>
                </div>
                <div className={`${isDarkMode ? 'bg-black/50 border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-500/10' : 'bg-gray-50 border-emerald-600/30 hover:border-emerald-600/50 hover:bg-emerald-50/50'} border rounded-2xl p-6 transition-all text-center`}>
                  <div className="text-4xl mb-4">⚖️</div>
                  <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Legal Research</h3>
                  <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Search through legal precedents and case law.
                  </p>
                  <button
                    onClick={() => openCalculator('research')}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg hover:from-emerald-400 hover:to-teal-400 hover:shadow-lg hover:shadow-emerald-500/50 transition-all text-sm font-medium"
                  >
                    Start Research
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
