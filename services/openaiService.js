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

