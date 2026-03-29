/**
 * Builds system and user prompt for interview question generation.
 * Used by the generate-questions API route (server-side) for terminal logging.
 */

function getInterviewTypeGuidelines(interviewType) {
  if (interviewType === 'Technical') {
    return `
**CRITICAL - TECHNICAL INTERVIEW REQUIREMENTS:**
You MUST generate GENUINE, INDUSTRY-STANDARD technical interview questions. This is NOT a general interview - these should be REAL technical questions that engineers actually face.

**REQUIRED QUESTION TYPES (must include):**
1. **Coding/Algorithm Problem** - Provide a specific coding challenge or algorithm problem. Include:
   - A concrete problem statement (e.g., "Given an array of integers, find the two numbers that add up to a target sum")
   - Specific constraints or requirements
   - Expected time/space complexity considerations
   - Should be relevant to technologies mentioned in the job description

2. **System Design Question** - Ask to design a system or architecture. Include:
   - A specific system to design (e.g., "Design a URL shortener like bit.ly" or "Design a distributed cache system")
   - Scale requirements (e.g., "handling 1 million requests per second")
   - Should relate to technologies/patterns mentioned in the job description

3. **Technology-Specific Deep Dive** - Ask detailed questions about specific technologies from the job description:
   - How specific frameworks/languages work internally
   - Best practices and patterns
   - Common pitfalls and how to avoid them
   - Performance optimization techniques

4. **Data Structure/Algorithm Theory** - Ask about:
   - When to use specific data structures
   - Algorithm complexity analysis
   - Trade-offs between different approaches

5. **Debugging/Problem-Solving** - Present a bug or issue scenario:
   - "Given this code snippet, identify the bug and explain how to fix it"
   - "How would you debug a production issue where..."

6. **Architecture/Design Patterns** - Ask about:
   - Design patterns relevant to the role
   - System architecture decisions
   - Scalability and performance considerations

7. **Real-World Technical Scenario** - Present a realistic technical challenge:
   - "How would you implement [specific feature] at scale?"
   - "How would you optimize [specific system/process]?"

**IMPORTANT:**
- Questions should be SPECIFIC and ACTIONABLE - not vague or generic
- Include actual coding problems, not just "tell me about your experience"
- Reference specific technologies, frameworks, or tools from the job description
- Make questions challenging but appropriate for the role level
- These should be questions that require technical knowledge to answer, not just experience stories
`;
  }
  if (interviewType === 'Behavioral') {
    return `
**CRITICAL - BEHAVIORAL INTERVIEW REQUIREMENTS:**
Generate genuine behavioral interview questions using the STAR method (Situation, Task, Action, Result).

**REQUIRED QUESTION TYPES (must include):**
1. **Leadership & Team Management** - "Tell me about a time when you had to lead a team through a difficult situation..."
2. **Conflict Resolution** - "Describe a situation where you disagreed with a colleague or manager. How did you handle it?"
3. **Problem-Solving Under Pressure** - "Give me an example of a time when you had to solve a critical problem with a tight deadline..."
4. **Failure & Learning** - "Tell me about a time when you made a mistake or failed at something. What did you learn?"
5. **Achievement & Impact** - "Describe your biggest professional achievement and the impact it had..."
6. **Adaptability** - "Tell me about a time when you had to adapt to a significant change..."
7. **Collaboration** - "Give me an example of a time when you had to work closely with someone whose personality was very different from yours..."

**IMPORTANT:**
- All questions should prompt for specific past experiences using STAR format
- Questions should be relevant to the role's requirements
- Focus on soft skills, teamwork, leadership, and problem-solving behaviors
`;
  }
  if (interviewType === 'Case Study') {
    return `
**CRITICAL - CASE STUDY INTERVIEW REQUIREMENTS:**
Generate genuine case study questions that require analytical thinking and problem-solving.

**REQUIRED QUESTION TYPES (must include):**
1. **Business Problem Analysis** - Present a business scenario and ask for analysis:
   - "A company's revenue has dropped 30% in the last quarter. Walk me through how you would investigate and address this..."
   - "A product launch is underperforming. What factors would you analyze and what actions would you recommend?"

2. **Market Analysis** - "How would you evaluate whether to enter a new market? What factors would you consider?"

3. **Strategic Decision-Making** - "A company is deciding between two strategic options. How would you help them make this decision?"

4. **Data Analysis Scenario** - "Given these metrics [describe scenario], what insights would you draw and what recommendations would you make?"

5. **Process Optimization** - "A company's customer acquisition cost has increased significantly. How would you diagnose and solve this problem?"

6. **Competitive Analysis** - "How would you analyze a competitor's strategy and develop a response?"

7. **Financial/ROI Analysis** - "A company is considering investing in [X]. How would you evaluate the ROI and make a recommendation?"

**IMPORTANT:**
- Questions should present realistic business scenarios
- Require structured thinking and analytical approach
- Should be relevant to the role and industry
- Focus on problem-solving methodology, not just answers
`;
  }
  if (interviewType === 'System Design') {
    return `
**CRITICAL - SYSTEM DESIGN INTERVIEW REQUIREMENTS:**
Generate genuine system design interview questions that are commonly asked at top tech companies.

**REQUIRED QUESTION TYPES (must include):**
1. **Large-Scale System Design** - "Design [specific system] that can handle [X] requests per second. Walk me through your approach..."
   - Examples: URL shortener, social media feed, search engine, chat system, video streaming platform

2. **Distributed Systems** - "How would you design a distributed [system] that ensures consistency and availability?"

3. **Database Design** - "Design a database schema for [specific use case] and explain your choices..."

4. **Caching Strategy** - "How would you implement a caching layer for [system]? What caching strategies would you use?"

5. **Scalability & Performance** - "How would you scale [system] from 1K to 1M users? What bottlenecks would you address?"

6. **API Design** - "Design a RESTful API for [specific functionality]. What endpoints, data models, and error handling would you include?"

7. **Real-Time Systems** - "How would you design a real-time [system] that needs to handle [specific requirements]?"

**IMPORTANT:**
- Questions should be specific system design challenges
- Should include scale requirements (traffic, data volume, etc.)
- Require discussion of trade-offs, scalability, reliability, and performance
- Should relate to technologies mentioned in the job description
`;
  }
  if (interviewType === 'Leadership') {
    return `
**CRITICAL - LEADERSHIP INTERVIEW REQUIREMENTS:**
Generate genuine leadership interview questions focused on management, strategy, and team leadership.

**REQUIRED QUESTION TYPES (must include):**
1. **Team Building** - "Tell me about a time when you had to build a team from scratch. What was your approach?"
2. **Change Management** - "Describe a situation where you had to lead your team through a major organizational change..."
3. **Decision-Making Under Uncertainty** - "Give me an example of a time when you had to make a difficult decision with incomplete information..."
4. **Conflict Management** - "Tell me about a time when you had to resolve a conflict between team members..."
5. **Performance Management** - "Describe how you've handled an underperforming team member..."
6. **Strategic Planning** - "Walk me through how you would develop and execute a strategic plan for [specific scenario]..."
7. **Influence Without Authority** - "Tell me about a time when you had to influence stakeholders who didn't report to you..."

**IMPORTANT:**
- Focus on leadership competencies and management skills
- Questions should probe for specific leadership experiences
- Should be relevant to the role's leadership requirements
`;
  }
  return `
**INTERVIEW TYPE: ${interviewType}**
Generate a mix of questions appropriate for this interview type, tailored to the role and job requirements.
- Include both technical and behavioral elements as relevant
- Focus on role-specific competencies
- Make questions realistic and commonly asked in real interviews
`;
}

/**
 * @param {{ jobDescription: string, role: string, companyWebsite?: string, interviewType: string, resumeText?: string, skills?: string }} params
 * @returns {{ systemContent: string, userContent: string }}
 */
export function buildInterviewQuestionsPrompt({
  jobDescription,
  role,
  companyWebsite = '',
  interviewType,
  resumeText = '',
  skills = '',
}) {
  const interviewTypeGuidelines = getInterviewTypeGuidelines(interviewType);

  const prompt = `You are an expert interview coach specializing in ${interviewType} interviews. Generate 5-6 GENUINE, INDUSTRY-STANDARD interview questions for a ${interviewType} interview for the role of ${role}.

**CRITICAL REQUIREMENTS:**
- Generate exactly 5-6 questions (aim for 6)
- Questions MUST be tailored to the specific job description provided
- Questions MUST match the interview type (${interviewType}) - these should be REAL ${interviewType} questions, not generic ones
- Questions should be appropriate for the role: ${role}
- Questions should consider the candidate's background (resume and skills)
- Make questions SPECIFIC, ACTIONABLE, and INDUSTRY-STANDARD
- Questions should be challenging but appropriate for the role level

${interviewTypeGuidelines}

**OUTPUT FORMAT:**
Return ONLY a numbered list of questions, one per line, like this:
1. [First question]
2. [Second question]
3. [Third question]
... (continue for 5-6 questions)

Do NOT include any explanations, introductions, or additional text. Just the numbered questions.

**JOB CONTEXT:**
Job Description:
${jobDescription}

Role: ${role}

${companyWebsite ? `Company Website: ${companyWebsite}` : ''}

${resumeText ? `Candidate's Resume/Background:\n${resumeText}` : ''}

${skills ? `Candidate's Skills:\n${skills}` : ''}

**REMINDER:**
- For Technical interviews: Include actual coding problems, system design questions, and technology-specific deep dives
- For Behavioral interviews: Use STAR method questions about past experiences
- For Case Study interviews: Present business scenarios requiring analytical thinking
- Make questions GENUINE and INDUSTRY-STANDARD - these should be questions that are actually asked in real ${interviewType} interviews

Generate 8-10 ${interviewType} interview questions now (we will select a subset for the interview):`;

  const userContent = `${prompt}\n\n---\n\n${prompt}`;

  const systemContent = `You are an expert interview coach specializing in ${interviewType} interviews. You create GENUINE, INDUSTRY-STANDARD interview questions that are actually asked at top companies. For technical interviews, you generate real coding problems, system design questions, and technology-specific challenges. For behavioral interviews, you use STAR method questions. For case studies, you present realistic business scenarios. Generate exactly 8-10 high-quality, specific, actionable questions that match the interview type, role, and job requirements. Do NOT include "Tell me about yourself" or elevator pitch - that is asked separately.`;

  return { systemContent, userContent };
}
