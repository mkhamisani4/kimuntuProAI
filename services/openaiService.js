'use client';

import OpenAI from 'openai';

// Dynamically import pdfjs-dist only when needed (client-side only)
let pdfjsLib = null;

const getPdfjsLib = async () => {
  if (!pdfjsLib && typeof window !== 'undefined') {
    try {
      // Try loading from the build directory first (most reliable)
      const pdfjsModule = await import('pdfjs-dist/build/pdf.min.mjs');
      
      // pdfjs-dist exports everything on the module object
      pdfjsLib = pdfjsModule;
      
      // Configure worker BEFORE any operations
      if (pdfjsLib && pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
      }
      
      // Verify we have the required functions
      if (!pdfjsLib.getDocument) {
        throw new Error('PDF.js getDocument function not found');
      }
    } catch (error) {
      console.error('Error loading PDF.js:', error);
      throw new Error(`Failed to load PDF.js: ${error.message}. Please ensure the server has been restarted after configuration changes.`);
    }
  }
  return pdfjsLib;
};

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Required for client-side usage
});

/**
 * Extract text from a PDF file
 */
export const extractResumeText = async (file) => {
  if (file.type === 'text/plain') {
    // Handle text files
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('Failed to read text file'));
      reader.readAsText(file);
    });
  } else if (file.type === 'application/pdf') {
    // Handle PDF files
    try {
      // Dynamically import pdfjs-dist only when processing PDFs
      const pdfjs = await getPdfjsLib();
      if (!pdfjs) {
        throw new Error('PDF.js library is not available. Please ensure you are running this in a browser environment.');
      }
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
      }
      
      return fullText.trim();
    } catch (error) {
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  } else {
    throw new Error('Unsupported file type. Please upload a .txt or .pdf file.');
  }
};

/**
 * Tailor resume to a specific job description using OpenAI
 */
export const tailorResume = async ({ 
  jobLink, 
  resumeText, 
  name, 
  phone, 
  email, 
  linkedin, 
  skills, 
  professionalExperience, 
  personalProjects, 
  education, 
  miscInfo 
}) => {
  if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured. Please set NEXT_PUBLIC_OPENAI_API_KEY in your .env.local file.');
  }

  const prompt = `You are an expert resume writer specializing in creating highly tailored resumes that match specific job descriptions. Your goal is to create a resume that looks like it was custom-written for THIS EXACT job posting.

CRITICAL - ONE PAGE MAXIMUM (STRICTLY ENFORCED):
The resume MUST fit on EXACTLY ONE PAGE ONLY. This is ABSOLUTELY NON-NEGOTIABLE. 
- If content exceeds one page, you MUST cut it down
- Prioritize ONLY the most relevant information to the job description
- Use shorter bullet points (maximum 1 line each)
- Combine information where possible
- Eliminate any non-essential details
- Be extremely concise - every word counts
- If you must choose between two items, choose the one more relevant to the job
- Maximum 3-4 one-line bullet points per entry
- If you cannot fit everything on one page, prioritize the most relevant content

**STEP 1: DEEP JOB DESCRIPTION ANALYSIS (DO THIS FIRST)**
Before writing anything, thoroughly analyze the job description. Extract EVERYTHING that will be used throughout the resume:

- **Extract ALL technologies mentioned**: Programming languages, frameworks, tools, platforms, databases, cloud services, etc. - These MUST appear in bullet points
- **Identify key methodologies**: Agile, Scrum, DevOps, CI/CD, TDD, etc. - Use these exact terms
- **List required skills**: Both technical and soft skills explicitly mentioned - Reference these in bullets
- **Note responsibilities**: What will the person actually do day-to-day? - Rewrite bullets to show you did these
- **Identify preferred qualifications**: What would make someone stand out? - Emphasize these in bullets
- **Extract industry-specific terms**: Domain-specific terminology and jargon - Use these exact phrases
- **Note metrics/outcomes they value**: What kind of impact do they care about? - Include similar metrics
- **Identify team structure mentions**: Collaboration, cross-functional, remote, etc. - Use these terms
- **Extract company values/culture**: Innovation, customer-focused, data-driven, etc. - Match this tone
- **Note any specific requirements**: Years of experience, certifications, education level
- **Extract action verbs they use**: "develop", "implement", "design", "manage", etc. - Use these same verbs
- **Identify their tone**: Technical, business-focused, innovative, collaborative, etc. - Match this exactly
- **Note their language style**: Formal, casual, technical jargon, business terms, etc. - Mirror this style
- **Extract key phrases**: "scalable solutions", "high-performance", "user-centric", etc. - Use these phrases

**STEP 2: SKILLS SECTION - INCLUDE ABSOLUTELY EVERYTHING (CRITICAL - NO FILTERING)**
Create a LONG, comprehensive skills section. This is the MOST IMPORTANT requirement - include EVERYTHING. Do NOT filter, do NOT prioritize, do NOT omit anything. Include ALL skills from ALL sources:

- **MANDATORY - ALL skills from user's input**: Include EVERY SINGLE skill, tool, technology, language, framework, library, platform, methodology, soft skill, or ANYTHING the user provided in the skills field. DO NOT OMIT A SINGLE ITEM. If the user lists 50 skills, include all 50. If they list 100, include all 100. This is ABSOLUTELY NON-NEGOTIABLE. NO EXCEPTIONS.

- **MANDATORY - ALL skills from user's resume** (if uploaded): Extract EVERY SINGLE technical skill, tool, language, framework, library, platform, methodology, technology, software, system, protocol, standard, or ANY keyword that could be considered a skill mentioned ANYWHERE in the resume. Extract from:
  * Skills sections
  * Experience descriptions
  * Project descriptions
  * Education sections
  * Certifications
  * Any other section
  * Don't miss ANYTHING. If it's mentioned, include it.

- **MANDATORY - ALL keywords from job description**: Extract EVERY SINGLE keyword, technology, tool, skill, framework, language, platform, methodology, software, system, protocol, or ANY term from the job description that could be considered a skill. Include:
  * ALL technologies mentioned (programming languages, frameworks, libraries, tools, platforms)
  * ALL methodologies mentioned (Agile, Scrum, DevOps, CI/CD, TDD, BDD, etc.)
  * ALL soft skills mentioned (communication, leadership, teamwork, project management, etc.)
  * ALL tools mentioned (Git, Docker, Jira, Confluence, Slack, etc.)
  * ALL cloud platforms mentioned (AWS, Azure, GCP, Heroku, Vercel, etc.)
  * ALL databases mentioned (PostgreSQL, MongoDB, Redis, MySQL, etc.)
  * ALL testing frameworks mentioned (Jest, Cypress, Selenium, pytest, etc.)
  * ALL build tools mentioned (npm, yarn, webpack, vite, pip, maven, gradle, etc.)
  * ALL operating systems mentioned (Linux, Windows, macOS, etc.)
  * ALL protocols mentioned (HTTP, REST, GraphQL, WebSocket, etc.)
  * ALL standards mentioned (ISO, IEEE, etc.)
  * ALL certifications mentioned (if relevant)
  * ANY other technical term or keyword
  * Extract EVERYTHING - don't leave anything out

- **NO FILTERING**: Do NOT filter skills. Do NOT prioritize. Do NOT remove duplicates (you can combine them, but don't omit). Include EVERYTHING from:
  1. User's input (ALL of it)
  2. User's resume (ALL of it)
  3. Job description (ALL keywords)

- **Format skills intelligently**: Group into logical categories (e.g., "Programming Languages:", "Frameworks & Libraries:", "Cloud & DevOps:", "Databases:", "Tools & Platforms:", "Methodologies:", "Soft Skills:", "Operating Systems:", "Protocols & Standards:", etc.). But include EVERYTHING in these categories.

- **Target length**: Aim for 50-100+ skills total. The skills section should be LONG and comprehensive. It's better to have too many skills than too few. Include everything.

- **REMEMBER**: 
  * User's input skills = MANDATORY - include EVERY SINGLE ONE
  * User's resume skills = MANDATORY - extract EVERY SINGLE ONE
  * Job description keywords = MANDATORY - extract EVERY SINGLE ONE
  * NO FILTERING, NO PRIORITIZING, NO OMITTING
  * Create a LONG, comprehensive skills section

- Use the section heading "SKILLS" (not "TECHNICAL SKILLS")

**STEP 3: DETAILED BULLET POINT TAILORING (HIGHEST PRIORITY - KEYWORD & SENTIMENT MATCHING)**
Each bullet point MUST be completely rewritten to be HIGHLY specific to the job description. This is the MOST CRITICAL aspect. The goal is to make EVERY bullet point reference job description keywords and match the job description's sentiment.

For EACH bullet point, follow this process:
1. **Extract keywords from job description**: Identify ALL relevant keywords, phrases, technologies, methodologies, and terminology from the job description that relate to this experience. TRY TO INCLUDE AS MUCH JOB DESCRIPTION KEYWORDS IN THE BULLET POINTS OF THE NEW RESUME.
2. **Identify sentiment/tone**: Determine the job description's tone (technical, business-focused, innovative, collaborative, data-driven, customer-centric, etc.)
3. **Rewrite the bullet** to:
   - **Use EXACT action verbs** from the job description (if job says "develop", use "Developed"; if job says "implement", use "Implemented"; if job says "design", use "Designed")
   - **Include MULTIPLE keywords** from the job description in each bullet (aim for 3-5 keywords per bullet)
   - **Use EXACT terminology** from the job description (if they say "microservices architecture", use that exact phrase; if they say "scalable solutions", use that phrase)
   - **Match their tone/sentiment**: If job is technical, be technical; if job is business-focused, emphasize business impact; if job is innovative, use innovative language
   - **Use their phrases**: If job mentions "high-performance systems", use that phrase; if job mentions "user-centric design", use that phrase
   - **Reference their responsibilities**: Show how your work directly addresses what they're looking for
   - **Include similar metrics**: If job values performance metrics, include performance numbers; if job values business metrics, include business numbers
   - **Show methodology alignment**: If job mentions Agile/Scrum/DevOps, explicitly mention these methodologies
   - **Demonstrate impact in their terms**: Use their language to describe impact (e.g., if they say "customer satisfaction", use that phrase)
   - **Make it read like it was written for THIS job**: Every bullet should sound like it was custom-written for this specific position

4. **CRITICAL - KEYWORD DENSITY**: 
   - **MOST bullet points (at least 80%)** should reference 3-5 keywords from the job description
   - **EVERY bullet point** should reference at least 1-2 keywords from the job description
   - **Keywords should appear naturally** throughout the resume, not just in one section
   - **Use the SAME terminology** the job description uses - don't paraphrase, use their exact words

5. **CRITICAL - SENTIMENT MATCHING**:
   - **Match their tone exactly**: If job description is enthusiastic, be enthusiastic; if it's formal, be formal; if it's technical, be technical
   - **Use their style**: If they use short sentences, use short sentences; if they use detailed descriptions, use detailed descriptions
   - **Match their values**: If they emphasize innovation, emphasize innovation; if they emphasize collaboration, emphasize collaboration
   - **Use their adjectives**: If they say "scalable", use "scalable"; if they say "robust", use "robust"; if they say "cutting-edge", use "cutting-edge"

6. **Example transformations**:
   - Generic: "Developed web applications"
   - Tailored (if job mentions React, TypeScript, AWS, scalable, high-performance): "Developed scalable, high-performance web applications using React and TypeScript, deployed on AWS with CI/CD pipelines, serving 10K+ daily active users and improving response times by 40%"
   
   - Generic: "Managed team projects"
   - Tailored (if job mentions Agile, stakeholder management, cross-functional, collaboration): "Led cross-functional Agile teams of 5+ developers, collaborating with stakeholders to manage requirements and deliver features in 2-week sprints, improving team velocity by 30%"

   - Generic: "Worked with databases"
   - Tailored (if job mentions PostgreSQL, data optimization, performance, scalability): "Optimized PostgreSQL database queries for improved performance and scalability, reducing query time by 60% through indexing strategies for high-traffic applications processing 1M+ requests daily"

7. **Every bullet MUST**:
   - Reference at least 1-2 keywords from the job description (preferably 3-5)
   - Use terminology that EXACTLY matches the job description's language
   - Match the sentiment/tone of the job description
   - Show clear relevance to what the employer is looking for
   - Sound like it was written specifically for this exact job
   - Use the same action verbs, adjectives, and phrases as the job description

**STEP 4: EXPERIENCE SECTION TAILORING**
- **Reorder experiences**: Put the most relevant experience first (based on job description requirements)
- **Select experiences**: If user has many experiences, prioritize those that:
  * Use technologies mentioned in the job description
  * Demonstrate responsibilities similar to the job
  * Show progression toward the role they're applying for
  * Include quantifiable achievements relevant to the job
- **For each position**:
  * Include 3-4 highly tailored bullet points (as described in Step 3)
  * Ensure at least 2 bullets directly address key job requirements
  * Use job description keywords naturally throughout
  * Show progression and impact relevant to the role

**STEP 5: PROJECTS SECTION TAILORING**
- **Select projects** that demonstrate:
  * Technologies mentioned in the job description
  * Problem-solving approaches relevant to the role
  * Impact similar to what the job values
- **For each project**:
  * Include 2-3 highly tailored bullet points
  * Mention specific technologies from the job description
  * Show how the project demonstrates relevant skills
  * Connect project outcomes to job-relevant metrics

**STEP 6: EDUCATION SECTION**
- If education is provided, use that information
- Otherwise, extract from the uploaded resume text
- Format: Institution Name, Degree, Major (if applicable), Graduation Date (right-aligned)
- Include only the most relevant education entries (prioritize higher degrees and recent dates)
- If multiple entries, list most recent first

**STEP 7: CONTACT INFORMATION**
- If name, phone, email, or linkedin are provided, use those EXACTLY as provided
- If not provided, extract from the uploaded resume text
- Format: Name on first line, then Phone | Email | LinkedIn on second line (if available)

**STEP 8: MISCELLANEOUS INFORMATION**
- If miscInfo is provided and contains actual content (not just placeholders), create appropriate sections like:
  - AWARDS
  - CERTIFICATIONS
  - PUBLICATIONS
  - VOLUNTEER WORK
  - LEADERSHIP
  - ACTIVITIES
- Only include these sections if miscInfo has meaningful content
- If miscInfo is empty or just placeholder text, DO NOT include these sections
- Format each entry with title/name and date (right-aligned)

**STEP 9: FINAL TAILORING CHECKLIST**
Before finalizing, ensure:
- ✓ Every major requirement from the job description is addressed in at least one bullet point
- ✓ Key technologies from the job description appear throughout the resume (in bullets, not just skills)
- ✓ Terminology EXACTLY matches the job description's language (use their exact words)
- ✓ At least 80% of bullet points reference 3-5 keywords from the job description
- ✓ ALL bullet points reference at least 1-2 keywords from the job description
- ✓ The sentiment/tone matches the job description exactly (technical, business-focused, innovative, etc.)
- ✓ Action verbs match the job description's style
- ✓ Adjectives and phrases match the job description's language
- ✓ Skills section includes relevant skills from both user experience AND job description
- ✓ Bullet points are specific and descriptive, not generic
- ✓ The resume reads like it was written specifically for this job
- ✓ Keywords from the job description appear naturally throughout the resume
- ✓ All content fits on one page

**RESUME STRUCTURE** (in this exact order):
1. Contact Information
2. EDUCATION
3. PROFESSIONAL EXPERIENCE (or RELEVANT EXPERIENCE)
4. PROJECTS
5. SKILLS
6. AWARDS / CERTIFICATIONS / OTHER (only if miscInfo is provided and not empty)

**FORMATTING REQUIREMENTS**:
- Use plain text format (NO LaTeX, NO markdown, NO special characters)
- Section headings should be in ALL CAPS (e.g., "EDUCATION", "PROFESSIONAL EXPERIENCE", "PROJECTS", "SKILLS")
- Dates should be right-aligned (you can indicate this with spacing, but output as plain text)
- Use consistent spacing between sections
- Do NOT include a summary or objective section
- Do NOT use brackets, asterisks, or other markdown formatting
- Keep formatting simple and clean for PDF generation

**OUTPUT FORMAT**:
- Output ONLY the resume text, nothing else
- No explanations, no comments, no metadata
- Start directly with the contact information
- End with the last section
- Ensure the entire resume fits on ONE PAGE when rendered

Job Description:
${jobLink || 'No job description provided'}

${resumeText ? `Original Resume Text:\n${resumeText}` : ''}

${name ? `Name: ${name}` : ''}
${phone ? `Phone: ${phone}` : ''}
${email ? `Email: ${email}` : ''}
${linkedin ? `LinkedIn: ${linkedin}` : ''}
${skills ? `Additional Skills: ${skills}` : ''}
${professionalExperience ? `Professional Experience: ${professionalExperience}` : ''}
${personalProjects ? `Personal Projects: ${personalProjects}` : ''}
${education ? `Education: ${education}` : ''}
${miscInfo ? `Miscellaneous Information: ${miscInfo}` : ''}

Generate a highly tailored, one-page resume that perfectly matches this job description, really make sure to incorporate the keywords and sentiment of the job description. Make each bullet point sound like it was custom-written specifically for this exact job and make it descriptive.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert resume writer specializing in creating highly tailored, one-page resumes that perfectly match specific job descriptions. You excel at deeply analyzing job descriptions to extract ALL keywords, phrases, terminology, and sentiment. You completely rewrite every bullet point to reference 3-5 keywords from the job description and match the job description\'s exact tone, style, and language. You use the same action verbs, adjectives, and phrases as the job description. You are skilled at combining skills from user experience with skills from job descriptions to create comprehensive, tailored resumes where every bullet point sounds like it was custom-written specifically for this exact job.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8, // Slightly higher for more creative tailoring
      max_tokens: 1400 // Reduced to enforce one-page constraint
    });

    const tailoredResume = completion.choices[0].message.content.trim();
    return tailoredResume;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    if (error.response) {
      throw new Error(`OpenAI API error: ${error.response.status} - ${error.response.statusText}`);
    } else if (error.message) {
      throw new Error(`OpenAI API error: ${error.message}`);
    } else {
      throw new Error('Failed to tailor resume. Please try again.');
    }
  }
};

/**
 * Generate a tailored cover letter based on user's resume, skills, experience, and job description
 */
export const generateCoverLetter = async ({
  jobDescription,
  resumeText = '',
  name = '',
  skills = '',
  experience = '',
  education = '',
  additionalInfo = ''
}) => {
  const prompt = `You are an expert cover letter writer. Generate a professional, compelling, and HUMAN cover letter that:
- Is tailored specifically to the job description provided
- Incorporates keywords and phrases from the job description naturally
- Highlights relevant skills and experience from the user's background
- Demonstrates genuine interest in the role and company
- Is professional, comprehensive, engaging, and AUTHENTICALLY HUMAN (approximately 5-6 paragraphs to fill one full page)
- Uses a respectful, warm, and natural tone - sound like a real person writing, not a robot
- References specific requirements from the job description
- Shows how the candidate's experience aligns with the role
- Includes forward-looking statements about what the candidate could accomplish in the role

**COVER LETTER STRUCTURE:**
1. **Opening Paragraph**: 
   - Express genuine, respectful interest in the position
   - Mention where you learned about the role (if applicable)
   - Briefly state why you're interested in a warm, human way
   - Keep it concise (2-3 sentences)
   - Sound natural and authentic, not robotic or overly formal

2. **Body Paragraph(s)**: 
   - This is the MOST IMPORTANT section - make it DETAILED, SPECIFIC, COMPREHENSIVE, and IMPRESSIVE
   - **CRITICAL - Length Requirement**: The cover letter MUST fill approximately one full page. Make paragraphs LONG and DETAILED. Aim for 4-5 substantial body paragraphs, each 4-6 sentences long. Do not be brief - be thorough and expansive.
   - **CRITICAL - WOW Factor - Focus on Future Impact and Achievements**: This is NOT a resume recap. Instead, paint a VISION of what you WILL achieve and the TRANSFORMATION you'll bring. Focus HEAVILY on forward-looking impact, potential, and what you CAN and WILL accomplish. Use bold, confident language about future outcomes: "I will [specific impressive action] that will [specific transformative impact]", "I am positioned to [achieve specific goal] that will [deliver specific value]", "I will drive [specific outcome] that directly addresses [their challenge/goal]". Make the hiring manager excited about what you'll bring, not just what you've done.
   - **CRITICAL - Strategic Value Proposition**: Don't just list past experiences - show how your background positions you to deliver EXCEPTIONAL future results. Frame everything as: "My [education/experience/skills] has equipped me to [achieve impressive future outcome] that will [deliver specific transformative value]". Make it about potential and vision, not just history.
   - **CRITICAL - Bold Achievement Statements**: Include confident, impressive statements about what you WILL accomplish. Use phrases like: "I will [specific impressive action] to [achieve specific transformative goal]", "I am ready to [deliver specific high-impact result] that will [create specific value]", "I will leverage [background] to [achieve specific outcome] that directly addresses [their specific challenge]". Be bold and confident (while respectful) - show ambition and vision.
   - **CRITICAL - Transformative Impact Focus**: Emphasize how you'll TRANSFORM their situation, not just fill a role. Show how you'll solve their biggest challenges, exceed their goals, and deliver exceptional value. Use language like: "I will transform [specific area] by [specific action] that will [deliver specific impressive outcome]", "I will elevate [specific function] to [specific higher level] through [specific approach]".
   - Connect your background to SPECIFIC future achievements and transformative outcomes, not just past experiences
   - For each point, show how your background positions you to deliver EXCEPTIONAL future results: "My [education/experience/skills] positions me to [achieve specific impressive outcome] that will [deliver specific transformative value] because [strategic connection]"
   - Use forward-looking metrics and outcomes: "I will drive [specific improvement] that will result in [specific impressive metric/outcome]", "I will deliver [specific result] that will [create specific value]"
   - Don't just recap the resume - show STRATEGIC VISION: "While my [background] demonstrates [capability], I am excited to apply this to [achieve specific impressive future outcome] that will [deliver specific transformative value] for your team"
   - Incorporate SPECIFIC goals, challenges, and needs from the job description and show how you'll EXCEED them
   - Show clear vision for transformation: "I will leverage my [background] to [achieve specific impressive goal] that will [deliver specific transformative impact] for [specific stakeholder/business area]"
   - Make it detailed and impressive - explain the FUTURE IMPACT and TRANSFORMATION you'll deliver, not just what you did in the past
   - Expand on each point: Paint a picture of the future value you'll create, describe the transformation you'll drive, explain the exceptional outcomes you'll deliver, detail the strategic impact you'll have
   - Focus on WHAT EXCEPTIONAL VALUE you WILL create for their SPECIFIC needs mentioned in the job description
   - Use 4-5 body paragraphs, each focusing on different aspects of the TRANSFORMATION and EXCEPTIONAL VALUE you'll deliver, showing vision and potential
   - Each paragraph should be substantial (4-6 sentences minimum) to ensure the letter fills a full page
   - **CRITICAL - Human Tone with Confidence**: Write in a natural, respectful, warm, and authentic way, but with CONFIDENCE and VISION. Sound like a real person with ambition and strategic thinking. Use varied sentence structure. Be genuine, sincere, and impressive. Show respect for the company while demonstrating you're ready to deliver exceptional results.

3. **Closing Paragraph**:
   - Include bold, forward-looking statements about what you WILL accomplish: "I am ready to [specific impressive action] that will [deliver specific transformative impact] for [specific goal from job description]", "I will bring [specific exceptional value] that will [achieve specific impressive outcome]"
   - Express genuine enthusiasm and CONFIDENCE in your ability to deliver exceptional results
   - Express desire for an interview with conviction
   - Professional, warm, but confident closing
   - Keep it brief (2-3 sentences)
   - Sound authentic, human, and impressive - show you're ready to make a significant impact

**FORMATTING:**
- Use professional business letter format
- **CRITICAL - Letter Structure**: Start with the sender's name at the top (if name is provided), then greeting, then paragraphs, then closing
- Include proper greeting (Dear Hiring Manager, or Dear [Company Name] Team, if company name is mentioned)
- Include proper closing (Sincerely, [Name])
- **CRITICAL - Paragraph Formatting (MANDATORY)**: 
  * ABSOLUTELY DO NOT use empty lines, blank lines, or double line breaks between ANY elements
  * ABSOLUTELY DO NOT skip lines between paragraphs - this is FORBIDDEN
  * The spacing between "Dear Hiring Manager," and the first paragraph is the CORRECT spacing - use that same single-line spacing throughout
  * Start each new paragraph on the IMMEDIATE next line with NO indentation - all paragraphs should be left-aligned
  * Paragraphs MUST flow directly one after another with ZERO blank lines between them
  * Use ONLY single line breaks to separate paragraphs
  * Example format:
    [Name]
    Dear Hiring Manager,
    [First paragraph text here with single line break after greeting, no blank line]
    [Second paragraph starts here with no indentation, single line break before, no blank line]
    [Third paragraph starts here with no indentation, single line break before, no blank line]
    Sincerely,
    [Name]
- Keep paragraphs detailed, comprehensive, and expansive (approximately 600-800 words total to fill one full page)
- Each body paragraph should be 4-6 sentences long - be thorough, not brief
- Expand on experiences with context about business challenges, the VALUE you delivered, the IMPACT on stakeholders/customers/business, and detailed measurable results
- Focus on IMPACT and VALUE creation, not technical implementation details
- Use clear, professional, but NATURAL and HUMAN language
- Match the tone of the job description (formal, casual, technical, etc.) while maintaining a warm, respectful, authentic human voice
- Sound like a real person writing, not an AI or template
- Be respectful, genuine, and sincere throughout
- **DO NOT include contact information** (email, phone, LinkedIn, address) in the cover letter body - only include name in the closing signature

**KEY REQUIREMENTS:**
- Extract ALL keywords, phrases, goals, challenges, and needs from the job description
- Reference SPECIFIC goals, responsibilities, challenges, and business needs mentioned in the job description
- Use the same action verbs and language style as the job description
- Show genuine, respectful enthusiasm with CONFIDENCE and VISION - demonstrate you're ready to deliver exceptional results
- Make it personal, specific, AUTHENTICALLY HUMAN, and IMPRESSIVE - avoid generic templates, robotic language, and resume recitation
- Write in a natural, conversational yet professional tone with CONFIDENCE and STRATEGIC VISION - like a real person with ambition would write
- Include bold, forward-looking statements about what you WILL accomplish: "I will [specific impressive action] that will [deliver specific transformative impact] to help [achieve specific goal]", "I am ready to [deliver specific exceptional value] that will [create specific impressive outcome]"
- Focus on FUTURE TRANSFORMATION and EXCEPTIONAL VALUE you WILL deliver, not just past experiences or technical skills
- Emphasize how you will EXCEED their SPECIFIC goals mentioned in the job description and deliver transformative impact
- **CRITICAL - Strategic Background Integration**: Seamlessly blend education, experience, and skills throughout the cover letter, but frame them as FOUNDATION for FUTURE ACHIEVEMENTS, not just past accomplishments. Don't treat them as separate sections - weave them together to show how your complete background positions you to deliver EXCEPTIONAL future results. For example: "My [degree/major] from [institution] and [experience] have equipped me to [achieve specific impressive future outcome] that will [deliver specific transformative value], directly addressing your need for [job requirement/goal]."
- **CRITICAL - Future-Focused Value Proposition**: For every experience, education, or skill you mention, show how it positions you to deliver EXCEPTIONAL FUTURE IMPACT. Don't just say "I have experience with X" - say "My [experience/education/skills] with X positions me to [achieve specific impressive future outcome] that will [deliver specific transformative value] for [specific goal/requirement from job description] because [strategic connection showing future potential]"
- **CRITICAL - Vision Over History**: Be detailed in explaining the FUTURE VALUE and TRANSFORMATION you WILL deliver, not just past accomplishments. Instead of "I worked on projects using technology X," say "I will leverage my [education/experience/skills] to [achieve specific impressive future outcome] that will [deliver specific transformative impact - e.g., transform operations, drive exceptional growth, create breakthrough results], which demonstrates my readiness to [exceed specific job requirement/goal from job description] because [explanation of how your future impact will address their needs]"
- **CRITICAL - Exceed Job Description Goals**: Reference SPECIFIC goals, challenges, responsibilities, and needs mentioned in the job description, and show how you will EXCEED them and deliver transformative impact. Don't just address their needs - show how you'll elevate their situation. Mix education, experience, and skills together to show a comprehensive strategic value proposition that positions you for exceptional future achievements.
- **CRITICAL - Paragraph Spacing (MANDATORY - NO EXCEPTIONS)**: ABSOLUTELY FORBIDDEN to use empty lines, blank lines, or line skips between paragraphs. This is a CRITICAL requirement. Instead, start each new paragraph on the IMMEDIATE next line with NO indentation - all paragraphs should be left-aligned. Paragraphs MUST flow directly one after another with ZERO blank lines between them. Use ONLY single line breaks, NEVER double spacing or empty lines. The output must have NO blank lines between paragraphs - if you see a blank line, you have made an error.
- **CRITICAL - No Contact Info**: DO NOT include any contact information (email, phone, LinkedIn, address) in the cover letter body. Only include the name in the closing signature (e.g., "Sincerely, [Name]"). The cover letter should contain only the letter content itself.

Job Description:
${jobDescription}

${resumeText ? `Resume/Background Information:\n${resumeText}` : ''}

${name ? `Name: ${name}` : ''}
${skills ? `Skills: ${skills}` : ''}
${experience ? `Experience: ${experience}` : ''}
${education ? `Education: ${education}` : ''}
${additionalInfo ? `Additional Information: ${additionalInfo}` : ''}

Generate a highly tailored cover letter that perfectly matches this job description. Make sure to incorporate keywords and sentiment from the job description throughout the letter. 

IMPORTANT FORMATTING REMINDER: 
- Start with [Name] at the top if name is provided
- Use the EXACT same spacing between "Dear Hiring Manager," and the first paragraph throughout the entire letter
- NO blank lines anywhere - only single line breaks
- NO indentation - all paragraphs should be left-aligned
- **CRITICAL - Length**: Make the cover letter LONG and DETAILED to fill approximately one full page. Use 4-5 substantial body paragraphs, each 4-6 sentences long. Be comprehensive and thorough, not brief. Expand on each experience, education, and skill with context about business challenges, the VALUE you delivered, the IMPACT on stakeholders/customers/business, and detailed measurable results.
- **CRITICAL - Focus**: Emphasize IMPACT, VALUE, and alignment with SPECIFIC goals from the job description. Less focus on technical details, more focus on business impact, value creation, and how you can help them achieve their specific objectives.
- **CRITICAL - Integration**: Seamlessly mix education, experience, and skills throughout the body paragraphs. Don't separate them - show how your complete background (education + experience + skills) creates value and impact that addresses their specific needs.
- **CRITICAL - Human & Respectful Tone**: Write in a natural, warm, respectful, and authentically human way. Sound like a real person writing a genuine letter, not a robot or template. Be respectful of the company and opportunity. Include forward-looking statements naturally: "If given this opportunity, I would be honored to [specific contribution] that would [specific impact]" or "I am excited about the possibility of [contributing to specific goal]". Make these statements sound genuine and respectful, not presumptuous.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert cover letter writer specializing in creating highly tailored, compelling, AUTHENTICALLY HUMAN, and IMPRESSIVE cover letters that perfectly match specific job descriptions. You excel at deeply analyzing job descriptions to extract ALL keywords, phrases, goals, challenges, business needs, and sentiment. You create detailed, personalized cover letters that paint a VISION of FUTURE IMPACT and TRANSFORMATION, not just resume recitation. You write in a natural, warm, respectful, genuinely human tone with CONFIDENCE and STRATEGIC VISION - like a real person with ambition writing, not a robot or template. You include bold, forward-looking statements about what the candidate WILL accomplish in the role (e.g., "I will [specific impressive action] that will [deliver transformative impact]"). You focus on how the candidate\'s background positions them to deliver EXCEPTIONAL FUTURE RESULTS and TRANSFORMATIVE IMPACT that will EXCEED the SPECIFIC goals and needs mentioned in the job description. CRITICAL FORMATTING RULE: You MUST format paragraphs with NO indentation (all paragraphs left-aligned) and ABSOLUTELY NO empty lines or line skips between paragraphs - paragraphs MUST flow directly one after another with ZERO blank lines. This is MANDATORY - if there are blank lines between paragraphs, you have failed. You NEVER include contact information (email, phone, LinkedIn, address) in the cover letter body - only the name in the closing signature. You focus heavily on detailed explanations of the FUTURE IMPACT, TRANSFORMATION, and EXCEPTIONAL VALUE the candidate WILL deliver, emphasizing strategic outcomes, vision, and how they will exceed their SPECIFIC goals from the job description. You write in a respectful, genuine, authentically human way with CONFIDENCE that sounds like a real person ready to make a significant impact, not an AI.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 1200 // Increased to allow for longer, more detailed cover letter
    });

    let coverLetter = completion.choices[0].message.content.trim();
    
    // Post-process to remove ALL blank lines and ensure proper formatting
    // Split into lines and filter out empty/whitespace-only lines
    const lines = coverLetter.split('\n');
    const processedLines = [];
    let isFirstParagraph = true;
    let isAfterGreeting = false;
    let hasNameAtTop = false;
    
    // Check if name should be at top (if provided)
    if (name && name.trim()) {
      processedLines.push(name.trim());
      hasNameAtTop = true;
    }
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      // Skip completely empty lines
      if (!trimmed) {
        continue;
      }
      
      // Skip if this is the name and we already added it at top
      if (hasNameAtTop && trimmed === name.trim()) {
        continue;
      }
      
      // Check if this is a greeting
      if (trimmed.match(/^Dear\s+/i)) {
        processedLines.push(line);
        isAfterGreeting = true;
        isFirstParagraph = true;
        continue;
      }
      
      // Check if this is a closing (Sincerely, Best regards, etc.)
      if (trimmed.match(/^(Sincerely|Best regards|Yours sincerely|Regards),?$/i)) {
        processedLines.push(line);
        continue;
      }
      
      // Check if this is the signature line (name after closing)
      if (i > 0 && lines[i-1] && lines[i-1].trim().match(/^(Sincerely|Best regards|Yours sincerely|Regards),?$/i)) {
        processedLines.push(line);
        continue;
      }
      
      // For body paragraphs - no indentation, all left-aligned
      if (isAfterGreeting && isFirstParagraph) {
        // First paragraph after greeting - no indentation
        processedLines.push(line.trimStart());
        isFirstParagraph = false;
      } else if (isAfterGreeting) {
        // Subsequent body paragraphs - remove any indentation, left-align
        processedLines.push(line.trimStart());
      } else {
        // Before greeting (shouldn't happen if name is at top, but handle it)
        processedLines.push(line.trimStart());
      }
    }
    
    coverLetter = processedLines.join('\n');
    
    // Final cleanup: remove any remaining double newlines or blank lines
    coverLetter = coverLetter.replace(/\n\n+/g, '\n');
    // Remove any trailing newlines
    coverLetter = coverLetter.replace(/\n+$/, '');
    
    return coverLetter;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    if (error.response) {
      throw new Error(`OpenAI API error: ${error.response.status} - ${error.response.statusText}`);
    } else if (error.message) {
      throw new Error(`OpenAI API error: ${error.message}`);
    } else {
      throw new Error('Failed to generate cover letter. Please try again.');
    }
  }
};

/**
 * Chatbot for job-related questions - can answer questions about resumes, cover letters, job descriptions, etc.
 */
export const chatJobAssistant = async ({
  message,
  conversationHistory = [],
  resumeText = '',
  coverLetterText = '',
  jobDescription = ''
}) => {
  const systemPrompt = `You are an expert career advisor and job search assistant. You help users with:
- Resume improvements and feedback
- Cover letter improvements and feedback
- Job description analysis and questions
- Interview preparation advice
- Career guidance
- Application tips and best practices
- Any job search or career-related questions

You provide helpful, constructive, and actionable advice. Be friendly, professional, and encouraging. When analyzing resumes or cover letters, be specific about what works well and what could be improved. When answering questions about job descriptions, provide detailed insights about requirements, qualifications, and how to position oneself.

${resumeText ? `The user has provided their resume for context:\n${resumeText}\n\n` : ''}
${coverLetterText ? `The user has provided their cover letter for context:\n${coverLetterText}\n\n` : ''}
${jobDescription ? `The user has provided a job description for context:\n${jobDescription}\n\n` : ''}

Answer the user's question comprehensively and helpfully.`;

  try {
    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      ...conversationHistory,
      {
        role: 'user',
        content: message
      }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI API Error:', error);
    if (error.response) {
      throw new Error(`OpenAI API error: ${error.response.status} - ${error.response.statusText}`);
    } else if (error.message) {
      throw new Error(`OpenAI API error: ${error.message}`);
    } else {
      throw new Error('Failed to get response. Please try again.');
    }
  }
};

/**
 * Generate interview questions based on job description, role, interview type, and user's resume
 */
export const generateInterviewQuestions = async ({
  jobDescription,
  role,
  companyWebsite = '',
  interviewType,
  resumeText = '',
  skills = ''
}) => {
  if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured. Please set NEXT_PUBLIC_OPENAI_API_KEY in your .env.local file.');
  }

  // Build interview type-specific guidelines
  let interviewTypeGuidelines = '';
  
  if (interviewType === 'Technical') {
    interviewTypeGuidelines = `
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
  } else if (interviewType === 'Behavioral') {
    interviewTypeGuidelines = `
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
  } else if (interviewType === 'Case Study') {
    interviewTypeGuidelines = `
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
  } else if (interviewType === 'System Design') {
    interviewTypeGuidelines = `
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
  } else if (interviewType === 'Leadership') {
    interviewTypeGuidelines = `
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
  } else {
    interviewTypeGuidelines = `
**INTERVIEW TYPE: ${interviewType}**
Generate a mix of questions appropriate for this interview type, tailored to the role and job requirements.
- Include both technical and behavioral elements as relevant
- Focus on role-specific competencies
- Make questions realistic and commonly asked in real interviews
`;
  }

  const prompt = `You are an expert interview coach specializing in ${interviewType} interviews. Generate 6-7 GENUINE, INDUSTRY-STANDARD interview questions for a ${interviewType} interview for the role of ${role}.

**CRITICAL REQUIREMENTS:**
- Generate exactly 6-7 questions (aim for 7)
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
... (continue for 6-7 questions)

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

Generate 6-7 ${interviewType} interview questions now:`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert interview coach specializing in ${interviewType} interviews. You create GENUINE, INDUSTRY-STANDARD interview questions that are actually asked at top companies. For technical interviews, you generate real coding problems, system design questions, and technology-specific challenges. For behavioral interviews, you use STAR method questions. For case studies, you present realistic business scenarios. You generate exactly 6-7 high-quality, specific, actionable questions that match the interview type, role, and job requirements.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    const questionsText = completion.choices[0].message.content.trim();
    // Parse questions into an array
    const questions = questionsText
      .split('\n')
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(line => line.length > 0);

    return questions;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    if (error.response) {
      throw new Error(`OpenAI API error: ${error.response.status} - ${error.response.statusText}`);
    } else if (error.message) {
      throw new Error(`OpenAI API error: ${error.message}`);
    } else {
      throw new Error('Failed to generate interview questions. Please try again.');
    }
  }
};

