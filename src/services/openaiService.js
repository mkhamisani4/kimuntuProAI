import OpenAI from 'openai';

// Initialize OpenAI client
let openaiClient = null;

export const initializeOpenAI = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    console.warn('OpenAI API key not found. Please add VITE_OPENAI_API_KEY to your .env.local file.');
    return null;
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // Note: In production, API calls should be made from a backend
    });
  }

  return openaiClient;
};

/**
 * Tailor a resume based on job posting and user information
 * @param {Object} params - Resume tailoring parameters
 * @param {string} params.jobLink - URL or text of the job posting
 * @param {string} params.resumeText - Text content of the user's resume
 * @param {string} params.name - User's name
 * @param {string} params.phone - User's phone number
 * @param {string} params.email - User's email
 * @param {string} params.linkedin - User's LinkedIn
 * @param {string} params.skills - User's skills (comma-separated or array)
 * @param {string} params.professionalExperience - User's professional work experience
 * @param {string} params.personalProjects - User's personal projects
 * @param {string} params.education - User's education
 * @param {string} params.miscInfo - Additional information
 * @returns {Promise<string>} - Tailored resume content
 */
export const tailorResume = async ({ jobLink, resumeText, name, phone, email, linkedin, skills, professionalExperience, personalProjects, education, miscInfo }) => {
  const client = initializeOpenAI();
  
  if (!client) {
    throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env.local file.');
  }

  // Format skills as a string if it's an array
  const skillsText = Array.isArray(skills) ? skills.join(', ') : skills;

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

Job Posting Information:
${jobLink || 'No job posting provided. Create a strong, professional resume.'}

Current Resume:
${resumeText || 'No existing resume provided. Create a professional resume based on the information provided.'}

Contact Information (MUST use this in the resume header if provided):
${name ? `Name: ${name}` : 'Name: Not provided - use placeholder'}
${phone ? `Phone: ${phone}` : 'Phone: Not provided'}
${email ? `Email: ${email}` : 'Email: Not provided'}
${linkedin ? `LinkedIn: ${linkedin}` : 'LinkedIn: Not provided'}

IMPORTANT: Use the contact information above in the resume header. Format as: Name on first line, then "Phone • Email • LinkedIn" on second line (only include provided contact info, skip if not provided).

User Skills:
${skillsText || 'No specific skills listed.'}

User Professional Experience:
${professionalExperience || 'No professional experience provided.'}

User Personal Projects:
${personalProjects || 'No personal projects provided.'}

User Education:
${education || 'No education provided.'}

Additional Information (Misc Info):
${miscInfo || 'No additional information provided.'}

CRITICAL TAILORING REQUIREMENTS (MOST IMPORTANT):
1. **KEYWORD MATCHING**: Extract key terms, technologies, skills, and phrases from the job description and naturally incorporate them throughout the resume. Use the EXACT terminology from the job posting when possible (e.g., if they say "agile methodology" use that, not "scrum").
2. **TONE MATCHING**: Match the tone and style of the job description. If it's formal and technical, be formal and technical. If it's innovative and dynamic, reflect that energy. If it emphasizes collaboration, highlight collaborative achievements.
3. **DESCRIPTIVITY MATCHING**: Match the level of detail in the job description. If the job description is detailed and specific, make bullet points detailed and specific. If it's concise, keep it concise but impactful.
4. **PRIORITIZATION**: Prioritize experiences, skills, and projects that are MOST RELEVANT to the job description. Lead with what matters most for this specific role.
5. **REQUIREMENT ALIGNMENT**: For each major requirement in the job description, ensure there's a corresponding skill, experience, or achievement highlighted in the resume.
6. **LANGUAGE CONSISTENCY**: Use the same industry terminology, acronyms, and phrasing style as the job description. If they use "full-stack development", use that. If they mention specific frameworks/tools, prioritize those in your skills section.
7. **SKILLS INTEGRATION**: Extract ALL skills from the user's uploaded resume (if provided) and include them in the SKILLS section. Additionally, add relevant skills from the job description that align with the user's background. Prioritize skills that appear in both the resume and job description. Do NOT omit skills from the user's resume.
8. **QUANTIFICATION**: Match the level of metrics used. If the job description emphasizes data-driven results, include specific numbers and percentages. If it's more qualitative, balance accordingly.

IMPORTANT FORMATTING REQUIREMENTS:
1. Output ONLY plain text resume - NO introductory text, NO "Sure! Below is...", NO explanations, NO LaTeX
2. Format exactly as follows (match this EXACT structure):

FIRST LAST
Phone • Email • LinkedIn • GitHub

Note: Use the contact information provided above. If contact information is provided, use it exactly as given. Format: Name on first line, then contact info on second line separated by • (middle dot).

EDUCATION

B.S. Computer Science                                                      Expected May 2021
Arizona State University, Tempe, AZ                                                      3.82 GPA
• Relevant coursework: Data Structures, Algorithms, Machine Learning

SKILLS

Programming Languages: Java, Python, JavaScript, C++
Front-End: React, HTML, CSS
Tools, Databases, and OS: Git, MySQL, Linux

PROFESSIONAL EXPERIENCE

McKesson, Scottsdale, AZ: Software Engineering Intern                                                      06/2019 - 08/2019
• Developed feature that increased user engagement by 30%
• Optimized database queries reducing load time by 25%
• Collaborated with team of 5 engineers on production code

PROJECTS

Daily Weather Update, Personal Project                                                      Summer 2019
• Built web application using React and Node.js
• Integrated weather API to display real-time forecasts
• Deployed to AWS with 100+ daily active users

3. DO NOT include a SUMMARY section - start directly with EDUCATION or other sections
4. **ONE PAGE MAXIMUM - STRICTLY ENFORCED**: The resume MUST fit on EXACTLY ONE PAGE. This is ABSOLUTELY CRITICAL. If you generate content that exceeds one page, you have FAILED. Be extremely concise. Use maximum 3-4 bullet points per experience/project entry. Keep bullet points to ONE line each. If you need to cut content, prioritize what's most relevant to the job description. Combine information where possible. Eliminate any non-essential details. Every word must earn its place.
5. Use bullet points WITHOUT square brackets. Format: Action Verb Accomplishment with Metric
6. **CRITICAL - BULLET POINT TAILORING (HIGHEST PRIORITY)**: Each bullet point MUST be HIGHLY descriptive and STRONGLY tailored to the job description. This is the most important aspect of the resume. Don't just list generic accomplishments - REWRITE and ENHANCE every bullet to show clear relevance to the job. For each bullet:
   - **ANALYZE the job description requirements** - identify specific skills, technologies, methodologies, or responsibilities mentioned
   - **REWRITE the bullet** to directly address those requirements - don't just copy from user input
   - **Use EXACT keywords and terminology** from the job description throughout the bullet
   - **Connect the accomplishment to SPECIFIC job requirements** - show how it demonstrates what they're looking for
   - **Be highly descriptive** - explain WHAT you did, HOW it relates to the job, and WHY it matters for this position
   - **Show impact and relevance** - quantify when possible and explain the connection to job needs
   - **Make it job-specific** - if the job mentions "agile development", use that phrase. If it mentions "stakeholder management", show how you did that
   - **Example transformation**: Instead of "Developed features" → "Developed scalable features using [job's tech stack] that improved [job-relevant metric], demonstrating [job requirement]"
   - If a bullet point cannot be meaningfully connected to the job description, either completely rewrite it to show relevance or remove it
   - **Every single bullet** should read like it was written specifically for this job, not a generic resume
7. Quantify achievements with numbers and percentages (use % not \%) - match the level of detail in the job description
8. **CRITICAL**: Weave keywords from the job description naturally throughout ALL sections - don't just list them, integrate them into achievements and descriptions
9. For EDUCATION: First line is "Degree Name" (left, bold) and "Date/Graduation" (right, normal). Second line is "Institution, Location" (left, normal) and "GPA" (right, normal) if applicable. Highlight coursework/projects relevant to the job. **REWRITE bullet points to be HIGHLY descriptive and STRONGLY tailored** - analyze job requirements and show how coursework/projects directly relate. Use job keywords and terminology. Make it clear why this education is relevant to THIS job.
10. For PROFESSIONAL EXPERIENCE: Use the "Professional Experience" information provided. First line is "Company, Location: Job Title" (left, bold) and "Date Range" (right, normal). Then bullet points below. **CRITICAL**: Do NOT just copy the user's experience - REWRITE and ENHANCE every bullet to be HIGHLY descriptive and STRONGLY tailored to the job description. Analyze the job requirements and rewrite each bullet to:
   - Use exact job keywords and terminology
   - Connect accomplishments to SPECIFIC job requirements
   - Show how the experience demonstrates what the job is looking for
   - Be highly descriptive - explain what, how, and why it matters for this job
   - Make it read like it was written specifically for this position
   - Every bullet should clearly show relevance to the job description
11. For PROJECTS: Use the "Personal Projects" information provided. First line is "Project Name, Type" (left, bold) and "Date Range" (right, normal). Then bullet points below. **CRITICAL**: Do NOT just copy the user's project description - REWRITE and ENHANCE every bullet to be HIGHLY descriptive and STRONGLY tailored to the job description. Analyze the job requirements and rewrite each bullet to:
   - Use exact job keywords and terminology
   - Connect project work to SPECIFIC job requirements
   - Show how the project demonstrates relevant skills mentioned in the job
   - Be highly descriptive - explain what technologies/methods you used that relate to the job
   - Make it read like it was written specifically for this position
   - Every bullet should clearly show how the project relates to the job description
   If both professional experience and personal projects are provided, create separate sections for PROFESSIONAL EXPERIENCE and PROJECTS.
12. For SKILLS: Use format "Category: item1, item2, item3" with category in bold. **CRITICAL SKILLS HANDLING**: 
   - If the user's uploaded resume (Current Resume) contains a skills section, extract ALL skills from that resume and include them in the SKILLS section
   - Additionally, identify relevant skills, technologies, and tools mentioned in the job description that are not already in the user's resume
   - Combine the user's existing skills from their resume with relevant skills from the job description
   - Prioritize skills that appear in BOTH the user's resume AND the job description at the beginning of each category
   - Then list other skills from the user's resume
   - Finally, add relevant skills from the job description that the user might have but weren't explicitly listed in their resume (if they align with the user's experience)
   - Do NOT add skills that are completely unrelated to the user's background
13. **MISC INFO/ADDITIONAL INFORMATION**: ONLY if "Additional Information" is provided (and it's NOT "No additional information provided"), you MUST include it in the resume. Create appropriate sections such as AWARDS, CERTIFICATIONS, ACTIVITIES, LEADERSHIP, VOLUNTEER WORK, PUBLICATIONS, or other relevant sections based on the content. If it's achievements/awards, use AWARDS section. If it's certifications, use CERTIFICATIONS. If it's volunteer work, use VOLUNTEER WORK. If it's publications, use PUBLICATIONS. Format these sections similarly to other sections with proper entries and bullet points. **REWRITE bullet points to be HIGHLY descriptive and STRONGLY tailored** - analyze job requirements and show how achievements/certifications/activities directly relate to the job. Use job keywords and terminology. Make it clear why this information is relevant to THIS job. **IMPORTANT**: If there is NO additional information provided (i.e., it says "No additional information provided"), DO NOT create AWARDS, CERTIFICATIONS, or any other misc sections. Only include these sections if actual misc information was provided.
14. Dates should be right-aligned (use spaces to align them - at least 15 spaces between left and right text)
15. Section headers should be ALL CAPS on their own line
16. Use proper spacing between sections - be very concise to fit on ONE PAGE
17. **REMEMBER**: This resume should read like it was written specifically for this job. Every section should reflect alignment with the job description's requirements, tone, and priorities. **Every single bullet point must be HIGHLY descriptive and STRONGLY tailored** - analyze the job description, identify requirements, and rewrite each bullet to show clear, specific relevance. Don't use generic bullets - make every bullet job-specific and highly descriptive.

Output ONLY the formatted resume text with no additional commentary or explanations.`;

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini', // Using a cost-effective model, can be changed to gpt-4 for better quality
      messages: [
        {
          role: 'system',
          content: 'You are an expert resume writer specializing in creating highly tailored, one-page resumes that are custom-written for specific job descriptions. You excel at keyword matching, tone alignment, and requirement mapping. You output ONLY plain text resumes with no introductory text. Never include phrases like "Sure!", "Below is", "Here is", or any explanations. Format resumes clearly with proper sections and spacing. Your resumes should read like they were written specifically for the target job, not generic templates.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7, // Slightly higher for more creative tailoring while maintaining structure
      max_tokens: 1400 // Reduced to enforce one page limit - be concise!
    });

    let resumeContent = completion.choices[0].message.content;
    
    // Remove any introductory text that might appear
    const introPatterns = [
      /^Sure!.*?Below is.*?resume.*?\n\n/gi,
      /^Here is.*?resume.*?\n\n/gi,
      /^Below is.*?resume.*?\n\n/gi,
      /^I've.*?resume.*?\n\n/gi,
      /^Here's.*?resume.*?\n\n/gi,
      /^Sure!.*?\n\n/gi,
      /^Here is.*?\n\n/gi,
      /^Below is.*?\n\n/gi,
      /^I've.*?\n\n/gi,
      /^Here's.*?\n\n/gi,
      /^Sure!.*?Below is.*?tailored resume.*?\n\n/gi,
      /^Below is.*?tailored resume.*?\n\n/gi,
      /^Here is.*?tailored resume.*?\n\n/gi,
      /```[a-z]*\n/gi,
      /```/g,
    ];
    
    introPatterns.forEach(pattern => {
      resumeContent = resumeContent.replace(pattern, '');
    });
    
    // Find the start of resume content (look for name pattern or section heading)
    const namePattern = /^[A-Z][A-Z\s]{2,30}$/m;
    const sectionPattern = /^(EDUCATION|EXPERIENCE|PROFESSIONAL EXPERIENCE|PROJECTS|TECHNOLOGIES|SKILLS|SUMMARY)$/im;
    
    const lines = resumeContent.split('\n');
    let startIndex = 0;
    
    // Find the first line that looks like a name or section heading
    for (let i = 0; i < Math.min(lines.length, 10); i++) {
      const line = lines[i].trim();
      if (namePattern.test(line) || sectionPattern.test(line)) {
        startIndex = i;
        break;
      }
    }
    
    if (startIndex > 0) {
      resumeContent = lines.slice(startIndex).join('\n');
    }
    
    // Remove any remaining intro text at the start
    resumeContent = resumeContent.replace(/^(Sure!|Here is|Below is|I've|Here's).*?\n/gi, '');
    
    return resumeContent.trim();
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error(`Failed to tailor resume: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Extract text from a resume file (PDF or text file)
 * @param {File} file - The resume file
 * @returns {Promise<string>} - Extracted text content
 */
export const extractResumeText = async (file) => {
  if (!file) {
    return '';
  }

  // If it's a text file, read it directly
  if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('Failed to read text file'));
      reader.readAsText(file);
    });
  }

  // If it's a PDF file, extract text using pdfjs-dist
  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    try {
      // Dynamically import pdfjs-dist
      const pdfjsLib = await import('pdfjs-dist');
      
      // Set worker source (required for pdfjs-dist)
      // Try local worker file first, then fallback to CDN
      // The worker file should be in the public folder (copied from node_modules)
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
      
      // Read file as array buffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Load PDF document
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      // Extract text from all pages
      let fullText = '';
      const numPages = pdf.numPages;
      
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Combine all text items from the page
        const pageText = textContent.items
          .map(item => item.str)
          .join(' ');
        
        fullText += pageText + '\n';
      }
      
      return fullText.trim();
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }

  // For other file types, try reading as text
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

