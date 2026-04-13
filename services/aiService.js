'use client';

// Dynamically import pdfjs-dist only when needed (client-side only)
let pdfjsLib = null;

const getPdfjsLib = async () => {
  if (!pdfjsLib && typeof window !== 'undefined') {
    try {
      const pdfjsModule = await import('pdfjs-dist/build/pdf.min.mjs');
      pdfjsLib = pdfjsModule;
      if (pdfjsLib && pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
      }
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

/**
 * Call the career assistant API route
 */
const callCareerAI = async (action, params) => {
  const response = await fetch('/api/ai/career-assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, params }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'AI request failed');
  }

  const data = await response.json();
  return data.content;
};

const readPlainTextFile = async (file) => await file.text();

const isPdfFile = (file) => {
  const name = (file?.name || '').toLowerCase();
  const type = file?.type || '';
  return (
    type === 'application/pdf' ||
    type === 'application/x-pdf' ||
    type === 'application/acrobat' ||
    type === 'applications/pdf' ||
    (type === 'application/octet-stream' && name.endsWith('.pdf')) ||
    name.endsWith('.pdf')
  );
};

export const extractCareerDocumentText = async (file) => {
  const name = (file?.name || '').toLowerCase();
  const type = file?.type || '';

  if (type === 'text/plain' || type === 'text/markdown' || name.endsWith('.txt') || name.endsWith('.md')) {
    return readPlainTextFile(file);
  }

  if (isPdfFile(file)) {
    try {
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
  }

  throw new Error('Unsupported file type. Please upload a .pdf, .txt, or .md file.');
};

/**
 * Extract text from a PDF file
 */
export const extractResumeText = async (file) => {
  return extractCareerDocumentText(file);
};

/**
 * Tailor resume to a specific job description
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
  try {
    return await callCareerAI('tailorResume', {
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
      miscInfo,
    });
  } catch (error) {
    console.error('Error tailoring resume:', error);
    throw new Error(`Failed to tailor resume: ${error.message}`);
  }
};

/**
 * Generate a cover letter
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
  try {
    return await callCareerAI('generateCoverLetter', {
      jobDescription,
      resumeText,
      name,
      skills,
      experience,
      education,
      additionalInfo,
    });
  } catch (error) {
    console.error('Error generating cover letter:', error);
    throw new Error(`Failed to generate cover letter: ${error.message}`);
  }
};

/**
 * Chat with job assistant
 */
export const chatJobAssistant = async ({
  message,
  conversationHistory = [],
  resumeText = '',
  coverLetterText = '',
  jobDescription = ''
}) => {
  try {
    return await callCareerAI('chatJobAssistant', {
      message,
      conversationHistory,
      resumeText,
      coverLetterText,
      jobDescription,
    });
  } catch (error) {
    console.error('Error with job assistant:', error);
    throw new Error(`Failed to get response: ${error.message}`);
  }
};

export const chatPersonalAssistant = async ({
  message,
  conversationHistory = [],
  documents = [],
  resumeText = '',
  coverLetterText = '',
  jobDescription = ''
}) => {
  try {
    return await callCareerAI('chatPersonalAssistant', {
      message,
      conversationHistory,
      documents,
      resumeText,
      coverLetterText,
      jobDescription,
    });
  } catch (error) {
    console.error('Error with personal assistant:', error);
    throw new Error(`Failed to get response: ${error.message}`);
  }
};

/**
 * Generate interview questions
 */
export const generateInterviewQuestions = async ({
  jobDescription,
  role,
  companyWebsite = '',
  interviewType,
  resumeText = '',
  skills = ''
}) => {
  try {
    const response = await callCareerAI('generateInterviewQuestions', {
      jobDescription,
      role,
      companyWebsite,
      interviewType,
      resumeText,
      skills,
    });

    // Try to parse as JSON array
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(response);
    } catch {
      // Return raw text if not valid JSON
      return response;
    }
  } catch (error) {
    console.error('Error generating interview questions:', error);
    throw new Error(`Failed to generate interview questions: ${error.message}`);
  }
};
