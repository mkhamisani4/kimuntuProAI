'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FileText, Target, Users, Shield, X, Loader2, Download, Copy, Check, Mail, MessageCircle, Send } from 'lucide-react';
import { tailorResume, extractResumeText, generateCoverLetter, chatJobAssistant } from '../services/openaiService';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

const CareerTrack = ({ language }) => {
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [formData, setFormData] = useState({});
  const [resumeFile, setResumeFile] = useState(null);
  const [hasExistingResume, setHasExistingResume] = useState(null); // null = not selected, true = yes, false = no
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedResume, setGeneratedResume] = useState(null);
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState(null);
  const [copied, setCopied] = useState(false);
  const [copiedCoverLetter, setCopiedCoverLetter] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCoverLetterSuccess, setShowCoverLetterSuccess] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatResumeFile, setChatResumeFile] = useState(null);
  const [chatCoverLetterFile, setChatCoverLetterFile] = useState(null);
  const [chatJobDescription, setChatJobDescription] = useState('');
  const [chatResumeText, setChatResumeText] = useState('');
  const [chatCoverLetterText, setChatCoverLetterText] = useState('');
  const chatMessagesEndRef = useRef(null);
  
  // Auto-scroll chat to bottom when new messages are added
  useEffect(() => {
    if (chatMessagesEndRef.current) {
      chatMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isLoading]);
  
  // Career Track Translations
  const careerTranslations = {
    en: {
      personalTrack: 'Personal Track',
      description: 'Level up your career with a CV Builder, Job Matching Platform, and Interview Simulator powered by AI.',
      seeFeatures: 'See Features',
      features: 'Personal Track Features',
      focusedTools: 'Focused tools to help you get started and succeed in your career journey.',
      cvBuilder: 'CV Builder',
      cvItems: [
        'Create a professional CV in minutes',
        'Guided sections and expert tips',
        'Export and share easily'
      ],
      cvDesc: 'Build a standout CV with our guided tool. Get expert tips for every section and export your CV for easy sharing. Perfect for students and professionals ready to showcase their experience.',
      jobMatch: 'Job Matching Platform',
      jobMatchItems: [
        'Discover jobs tailored to your profile',
        'AI-powered matching and recommendations',
        'Track applications in one place'
      ],
      jobMatchDesc: 'Find jobs that fit your skills and goals. Our AI matches you to opportunities and helps you track your applications, so you never miss a chance.',
      interview: 'Interview Simulator',
      interviewItems: [
        'Practice with realistic interview scenarios',
        'Sentiment analysis and facial recognition',
        'Instant feedback and tailored questions',
        'Industry standards and best practices'
      ],
      interviewDesc: 'Practice interviews in a realistic, AI-powered environment. Advanced features include sentiment analysis, facial recognition, and instant feedback. Get tailored questions based on your industry and experience, and learn best practices to stand out in any interview.',
      coverLetter: 'Cover Letter Builder',
      coverLetterItems: [
        'Generate tailored cover letters in minutes',
        'AI-powered keyword matching',
        'Professional formatting and tone'
      ],
      coverLetterDesc: 'Create compelling, job-specific cover letters that highlight your relevant experience and skills. Our AI analyzes the job description and crafts a personalized letter that matches the employer\'s tone and incorporates key keywords.',
      jobChatbot: 'ProLaunch AI Assistant',
      jobChatbotItems: [
        'Ask questions about your resume',
        'Get cover letter feedback',
        'Analyze job descriptions',
        'Career guidance and advice'
      ],
      jobChatbotDesc: 'Get instant answers to any job search or career-related questions. Upload your resume or cover letter for personalized feedback, ask about job descriptions, or get career advice.',
      privacyFirst: 'Privacy First',
      privacyDesc: 'Your information is never shared. Backed by Firebase and AWS for maximum security.'
    },
    fr: {
      personalTrack: 'Piste personnelle',
      description: 'Améliorez votre carrière avec un constructeur de CV, une plateforme de correspondance d\'emploi et un simulateur d\'entrevue alimentés par l\'IA.',
      seeFeatures: 'Voir les fonctionnalités',
      features: 'Fonctionnalités de la piste personnelle',
      focusedTools: 'Outils ciblés pour vous aider à démarrer et réussir dans votre parcours de carrière.',
      cvBuilder: 'Constructeur de CV',
      cvItems: [
        'Créez un CV professionnel en quelques minutes',
        'Sections guidées et conseils d\'experts',
        'Export et partage facile'
      ],
      cvDesc: 'Créez un CV remarquable avec notre outil guidé. Obtenez des conseils d\'experts pour chaque section et exportez votre CV pour un partage facile. Parfait pour les étudiants et les professionnels prêts à présenter leur expérience.',
      jobMatch: 'Plateforme de correspondance d\'emploi',
      jobMatchItems: [
        'Découvrez des emplois adaptés à votre profil',
        'Correspondance et recommandations alimentées par l\'IA',
        'Suivez les candidatures en un seul endroit'
      ],
      jobMatchDesc: 'Trouvez des emplois qui correspondent à vos compétences et à vos objectifs. Notre IA vous met en relation avec des opportunités et vous aide à suivre vos candidatures, vous ne manquerez donc jamais une chance.',
      interview: 'Simulateur d\'entrevue',
      interviewItems: [
        'Pratiquez avec des scénarios d\'entrevue réalistes',
        'Analyse du sentiment et reconnaissance faciale',
        'Rétroaction instantanée et questions adaptées',
        'Normes et meilleures pratiques de l\'industrie'
      ],
      interviewDesc: 'Pratiquez des entrevues dans un environnement réaliste alimenté par l\'IA. Les fonctionnalités avancées incluent l\'analyse du sentiment, la reconnaissance faciale et la rétroaction instantanée. Obtenez des questions adaptées en fonction de votre industrie et de votre expérience, et apprenez les meilleures pratiques pour vous démarquer lors de toute entrevue.',
      coverLetter: 'Constructeur de lettre de motivation',
      coverLetterItems: [
        'Générez des lettres de motivation adaptées en quelques minutes',
        'Correspondance de mots-clés alimentée par l\'IA',
        'Formatage et ton professionnels'
      ],
      coverLetterDesc: 'Créez des lettres de motivation convaincantes et spécifiques à l\'emploi qui mettent en valeur votre expérience et vos compétences pertinentes. Notre IA analyse la description de poste et rédige une lettre personnalisée qui correspond au ton de l\'employeur et intègre les mots-clés essentiels.',
      jobChatbot: 'Assistant IA ProLaunch',
      jobChatbotItems: [
        'Posez des questions sur votre CV',
        'Obtenez des commentaires sur votre lettre de motivation',
        'Analysez les descriptions de poste',
        'Conseils de carrière et orientation'
      ],
      jobChatbotDesc: 'Obtenez des réponses instantanées à toutes vos questions sur la recherche d\'emploi ou la carrière. Téléchargez votre CV ou votre lettre de motivation pour des commentaires personnalisés, posez des questions sur les descriptions de poste ou obtenez des conseils de carrière.',
      privacyFirst: 'Confidentialité avant tout',
      privacyDesc: 'Vos informations ne sont jamais partagées. Soutenu par Firebase et AWS pour une sécurité maximale.'
    }
  };
  
  const t = careerTranslations[language] || careerTranslations.en;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResumeFile(file);
      setError(null);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setGeneratedResume(null);

    try {
      let resumeText = '';

      // Extract resume text if file is uploaded
      if (hasExistingResume === true && resumeFile) {
        resumeText = await extractResumeText(resumeFile);
      }

      // Validate required fields
      if (hasExistingResume === false) {
        if (!formData.name || !formData.skills || !formData.professionalExperience || !formData.education) {
          throw new Error('Please fill in all required fields: Name, Skills, Professional Experience, and Education.');
        }
      } else if (hasExistingResume === true && !resumeFile) {
        throw new Error('Please upload a resume file.');
      }

      if (!formData.jobDescription) {
        throw new Error('Please provide a job description.');
      }

      // Call OpenAI API to tailor resume
      const tailoredResume = await tailorResume({
        jobLink: formData.jobDescription,
        resumeText: resumeText,
        name: formData.name || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        linkedin: formData.linkedin || undefined,
        skills: formData.skills || undefined,
        professionalExperience: formData.professionalExperience || undefined,
        personalProjects: formData.personalProjects || undefined,
        education: formData.education || undefined,
        miscInfo: formData.miscInfo || undefined
      });

      setGeneratedResume(tailoredResume);
      setShowSuccess(true);
      
      // Show success notification and scroll to download section
      setTimeout(() => {
        const downloadSection = document.getElementById('download-section');
        if (downloadSection) {
          downloadSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      
      // Remove pulse animation after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error tailoring resume:', err);
      setError(err.message || 'Failed to tailor resume. Please try again.');
      setTimeout(() => {
        setError(null);
      }, 10000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!generatedResume) {
      setError('No resume content available to download.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Parse text content and generate PDF
      const pdf = generatePDFFromText(generatedResume);
      
      // Save the PDF
      pdf.save('tailored-resume.pdf');
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError(err.message || 'Failed to generate PDF. Please try again.');
      setTimeout(() => {
        setError(null);
      }, 10000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedResume) return;
    
    try {
      await navigator.clipboard.writeText(generatedResume);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyCoverLetter = async () => {
    if (!generatedCoverLetter) return;
    
    try {
      await navigator.clipboard.writeText(generatedCoverLetter);
      setCopiedCoverLetter(true);
      setTimeout(() => setCopiedCoverLetter(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCoverLetterSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setGeneratedCoverLetter(null);

    try {
      let resumeText = '';

      // Extract resume text if file is uploaded
      if (resumeFile) {
        resumeText = await extractResumeText(resumeFile);
      }

      // Validate required fields
      if (!formData.jobDescription) {
        throw new Error('Please provide a job description.');
      }

      // Call OpenAI API to generate cover letter
      const coverLetter = await generateCoverLetter({
        jobDescription: formData.jobDescription,
        resumeText: resumeText,
        name: formData.name || '',
        skills: formData.skills || '',
        experience: formData.experience || '',
        education: formData.education || '',
        additionalInfo: formData.additionalInfo || ''
      });

      setGeneratedCoverLetter(coverLetter);
      setShowCoverLetterSuccess(true);
      
      // Show success notification and scroll to download section
      setTimeout(() => {
        const downloadSection = document.getElementById('cover-letter-download-section');
        if (downloadSection) {
          downloadSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      
      // Remove pulse animation after 3 seconds
      setTimeout(() => {
        setShowCoverLetterSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error generating cover letter:', err);
      setError(err.message || 'Failed to generate cover letter. Please try again.');
      setTimeout(() => {
        setError(null);
      }, 10000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCoverLetterDownload = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!generatedCoverLetter) {
      setError('No cover letter content available to download.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);
      let yPos = margin;
      
      doc.setFont('helvetica');
      doc.setFontSize(11);
      
      // Split cover letter into lines and render
      const lines = generatedCoverLetter.split('\n');
      let isFirstParagraph = true;
      let isAfterGreeting = false;
      
      lines.forEach((line, index) => {
        if (yPos > pageHeight - 20) {
          doc.addPage();
          yPos = margin;
        }
        
        const trimmedLine = line.trim();
        if (!trimmedLine) {
          // Skip empty lines - they shouldn't exist but handle gracefully
          return;
        }
        
        // Check if this is the name at top (first line, not greeting/closing)
        if (index === 0 && !trimmedLine.match(/^(Dear|Sincerely|Best regards|Yours sincerely)/i)) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.text(trimmedLine, margin, yPos);
          yPos += 7;
          doc.setFontSize(11);
          return;
        }
        
        // Check if it's a greeting
        if (trimmedLine.match(/^Dear\s+/i)) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(11);
          doc.text(trimmedLine, margin, yPos);
          yPos += 6; // Single line break spacing
          isAfterGreeting = true;
          isFirstParagraph = true;
          return;
        }
        
        // Check if it's a closing (Sincerely, Best regards, etc.)
        if (trimmedLine.match(/^(Sincerely|Best regards|Yours sincerely|Regards),?$/i)) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(11);
          doc.text(trimmedLine, margin, yPos);
          yPos += 6; // Single line break spacing
          return;
        }
        
        // Check if it's the signature (line after closing)
        if (index > 0 && lines[index - 1] && lines[index - 1].trim().match(/^(Sincerely|Best regards|Yours sincerely|Regards),?$/i)) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(11);
          doc.text(trimmedLine, margin, yPos);
          yPos += 6;
          return;
        }
        
        // Body paragraphs
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        
        if (isAfterGreeting && isFirstParagraph) {
          // First paragraph - no indentation
          const textLines = doc.splitTextToSize(trimmedLine, maxWidth);
          doc.text(textLines, margin, yPos);
          yPos += textLines.length * 5.5;
          isFirstParagraph = false;
        } else if (isAfterGreeting) {
          // Subsequent paragraphs - no indentation, all left-aligned
          const textLines = doc.splitTextToSize(trimmedLine, maxWidth);
          doc.text(textLines, margin, yPos);
          yPos += textLines.length * 5.5;
        } else {
          // Before greeting (shouldn't happen, but handle it)
          const textLines = doc.splitTextToSize(trimmedLine, maxWidth);
          doc.text(textLines, margin, yPos);
          yPos += textLines.length * 5.5;
        }
      });
      
      doc.save('cover-letter.pdf');
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError(err.message || 'Failed to generate PDF. Please try again.');
      setTimeout(() => {
        setError(null);
      }, 10000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCoverLetterDownloadDOCX = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!generatedCoverLetter) {
      setError('No cover letter content available to download.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const lines = generatedCoverLetter.split('\n');
      const docxParagraphs = [];
      let isFirstParagraph = true;
      let isAfterGreeting = false;
      
      lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) {
          return; // Skip empty lines
        }
        
        // Check if this is the name at top (first line, not greeting/closing)
        if (index === 0 && !trimmedLine.match(/^(Dear|Sincerely|Best regards|Yours sincerely)/i)) {
          docxParagraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: trimmedLine,
                  bold: true,
                  size: 24, // 12pt in half-points
                }),
              ],
              spacing: { after: 120 }, // 6pt spacing
            })
          );
          return;
        }
        
        // Check if it's a greeting
        if (trimmedLine.match(/^Dear\s+/i)) {
          docxParagraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: trimmedLine,
                  size: 22, // 11pt
                }),
              ],
              spacing: { after: 120 }, // 6pt spacing
            })
          );
          isAfterGreeting = true;
          isFirstParagraph = true;
          return;
        }
        
        // Check if it's a closing (Sincerely, Best regards, etc.)
        if (trimmedLine.match(/^(Sincerely|Best regards|Yours sincerely|Regards),?$/i)) {
          docxParagraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: trimmedLine,
                  size: 22, // 11pt
                }),
              ],
              spacing: { after: 120 }, // 6pt spacing
            })
          );
          return;
        }
        
        // Check if it's the signature (line after closing)
        if (index > 0 && lines[index - 1] && lines[index - 1].trim().match(/^(Sincerely|Best regards|Yours sincerely|Regards),?$/i)) {
          docxParagraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: trimmedLine,
                  size: 22, // 11pt
                }),
              ],
              spacing: { after: 120 },
            })
          );
          return;
        }
        
        // Body paragraphs
        if (isAfterGreeting && isFirstParagraph) {
          docxParagraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: trimmedLine,
                  size: 22, // 11pt
                }),
              ],
              spacing: { after: 120 },
            })
          );
          isFirstParagraph = false;
        } else if (isAfterGreeting) {
          docxParagraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: trimmedLine,
                  size: 22, // 11pt
                }),
              ],
              spacing: { after: 120 },
            })
          );
        } else {
          docxParagraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: trimmedLine,
                  size: 22, // 11pt
                }),
              ],
              spacing: { after: 120 },
            })
          );
        }
      });
      
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: docxParagraphs,
          },
        ],
      });
      
      const blob = await Packer.toBlob(doc);
      saveAs(blob, 'cover-letter.docx');
    } catch (err) {
      console.error('Error generating DOCX:', err);
      setError(err.message || 'Failed to generate DOCX. Please try again.');
      setTimeout(() => {
        setError(null);
      }, 10000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatResumeFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setChatResumeFile(file);
      try {
        const text = await extractResumeText(file);
        setChatResumeText(text);
      } catch (err) {
        console.error('Error extracting resume text:', err);
        setError('Failed to extract text from resume file.');
      }
    }
  };

  const handleChatCoverLetterFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setChatCoverLetterFile(file);
      if (file.type === 'text/plain') {
        const text = await file.text();
        setChatCoverLetterText(text);
      } else {
        setError('Cover letter file must be a .txt file.');
      }
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setIsLoading(true);
    setError(null);

    // Add user message to chat
    const newUserMessage = { role: 'user', content: userMessage };
    setChatMessages(prev => [...prev, newUserMessage]);

    try {
      // Build conversation history (last 10 messages for context)
      const recentHistory = chatMessages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await chatJobAssistant({
        message: userMessage,
        conversationHistory: recentHistory,
        resumeText: chatResumeText,
        coverLetterText: chatCoverLetterText,
        jobDescription: chatJobDescription
      });

      // Add assistant response to chat
      const assistantMessage = { role: 'assistant', content: response };
      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Error getting chat response:', err);
      setError(err.message || 'Failed to get response. Please try again.');
      // Remove the user message if there was an error
      setChatMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const generatePDFFromText = (resumeText) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    let yPos = margin;
    
    doc.setFont('helvetica');
    
    // Parse plain text resume into structured data (first pass)
    const lines = resumeText.split('\n');
    const resume = {
      name: '',
      contact: '',
      sections: []
    };
    
    let currentSection = null;
    let currentEntry = null;
    let i = 0;
    
    // Parse name and contact info
    while (i < lines.length && !lines[i].match(/^(EDUCATION|PROFESSIONAL EXPERIENCE|RELEVANT EXPERIENCE|EXPERIENCE|PROJECTS|SKILLS|TECHNICAL SKILLS|AWARDS|CERTIFICATIONS|PUBLICATIONS|VOLUNTEER WORK|LEADERSHIP|ACTIVITIES)/i)) {
      const line = lines[i].trim();
      if (line) {
        if (!resume.name) {
          resume.name = line;
        } else if (!resume.contact) {
          resume.contact = line;
        }
      }
      i++;
    }
    
    // Parse sections
    while (i < lines.length) {
      const line = lines[i].trim();
      
      if (!line) {
        i++;
        continue;
      }
      
      // Check if this is a section heading
      const sectionMatch = line.match(/^(EDUCATION|PROFESSIONAL EXPERIENCE|RELEVANT EXPERIENCE|EXPERIENCE|PROJECTS|SKILLS|TECHNICAL SKILLS|AWARDS|CERTIFICATIONS|PUBLICATIONS|VOLUNTEER WORK|LEADERSHIP|ACTIVITIES)/i);
      if (sectionMatch) {
        // Save previous section if exists
        if (currentSection) {
          if (currentEntry) {
            currentSection.entries.push(currentEntry);
            currentEntry = null;
          }
          resume.sections.push(currentSection);
        }
        
        // Start new section
        currentSection = {
          title: sectionMatch[1].toUpperCase(),
          entries: []
        };
        currentEntry = null;
        i++;
        continue;
      }
      
      // Check if this is an entry header (has date on the right or company/position pattern)
      const dateMatch = line.match(/(.+?)\s+(\d{4}|\w+\s+\d{4}|Present|Current)$/);
      const hasRightAlignedDate = dateMatch && dateMatch[2];
      
      // Check for entry patterns: Company/Position or Institution/Degree
      const isEntryHeader = hasRightAlignedDate || 
        (line.includes(',') && !line.startsWith('•') && !line.startsWith('-') && currentSection && 
         (currentSection.title === 'EDUCATION' || currentSection.title === 'PROFESSIONAL EXPERIENCE' || 
          currentSection.title === 'EXPERIENCE' || currentSection.title === 'PROJECTS'));
      
      if (isEntryHeader && currentSection) {
        // Save previous entry if exists
        if (currentEntry) {
          currentSection.entries.push(currentEntry);
        }
        
        // Start new entry
        currentEntry = {
          header: line,
          bullets: []
        };
        i++;
        continue;
      }
      
      // Check if this is a bullet point
      if ((line.startsWith('•') || line.startsWith('-')) && currentEntry) {
        const bulletText = line.replace(/^[•\-]\s*/, '').trim();
        if (bulletText) {
          currentEntry.bullets.push(bulletText);
        }
      } else if (currentEntry && line && !line.match(/^(EDUCATION|PROFESSIONAL EXPERIENCE|RELEVANT EXPERIENCE|EXPERIENCE|PROJECTS|SKILLS|TECHNICAL SKILLS|AWARDS|CERTIFICATIONS|PUBLICATIONS|VOLUNTEER WORK|LEADERSHIP|ACTIVITIES)/i)) {
        // If it's not a section heading and we have an entry, treat as bullet or content
        if (line.includes(':') && line.split(':').length === 2) {
          // Might be a category in skills section
          if (currentSection && currentSection.title === 'SKILLS') {
            currentEntry = {
              header: line,
              bullets: []
            };
          } else {
            currentEntry.bullets.push(line);
          }
        } else {
          currentEntry.bullets.push(line);
        }
      } else if (currentSection && !currentEntry) {
        // Content without entry structure (like skills categories)
        currentEntry = {
          header: line,
          bullets: []
        };
      }
      
      i++;
    }
    
    // Save last entry and section
    if (currentEntry && currentSection) {
      currentSection.entries.push(currentEntry);
    }
    if (currentSection) {
      resume.sections.push(currentSection);
    }
    
    // Second pass: Render to PDF
    // Render name
    if (resume.name) {
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      const nameLines = doc.splitTextToSize(resume.name, maxWidth);
      doc.text(nameLines, margin, yPos);
      yPos += nameLines.length * 7;
    }
    
    // Render contact info
    if (resume.contact) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const contactLines = doc.splitTextToSize(resume.contact, maxWidth);
      doc.text(contactLines, margin, yPos);
      yPos += contactLines.length * 5;
    }
    
    yPos += 5; // Space after contact info
    
    // Render sections
    resume.sections.forEach((section, sectionIndex) => {
      // Check if we need a new page
      if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = margin;
      }
      
      // Section heading
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      const sectionTitle = section.title === 'TECHNICAL SKILLS' ? 'SKILLS' : section.title;
      doc.text(sectionTitle, margin, yPos);
      
      // Draw line below heading
      yPos += 3;
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, margin + maxWidth, yPos);
      yPos += 4; // Small space below border line
      
      // Render entries
      section.entries.forEach((entry) => {
        // Check if we need a new page
        if (yPos > pageHeight - 20) {
          doc.addPage();
          yPos = margin;
        }
        
        if (section.title === 'SKILLS' || section.title === 'TECHNICAL SKILLS') {
          // Skills section - special handling
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          
          // Check if entry.header contains category format (e.g., "**Category:** items")
          const categoryMatch = entry.header.match(/\*\*(.+?):\*\*\s*(.+)/);
          if (categoryMatch) {
            // Category format
            doc.setFont('helvetica', 'bold');
            doc.text(categoryMatch[1] + ':', margin, yPos);
            doc.setFont('helvetica', 'normal');
            const categoryItems = doc.splitTextToSize(categoryMatch[2], maxWidth - 10);
            doc.text(categoryItems, margin + 10, yPos);
            yPos += categoryItems.length * 5;
          } else {
            // Plain text format
            const skillLines = doc.splitTextToSize(entry.header, maxWidth);
            doc.text(skillLines, margin, yPos);
            yPos += skillLines.length * 5;
          }
          
          // Add bullets if any
          entry.bullets.forEach((bullet) => {
            if (yPos > pageHeight - 15) {
              doc.addPage();
              yPos = margin;
            }
            const bulletLines = doc.splitTextToSize(bullet, maxWidth - 5);
            doc.text(bulletLines, margin + 5, yPos);
            yPos += bulletLines.length * 5;
          });
        } else {
          // Other sections - entry with header and bullets
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          
          // First, try to extract dates from header itself (e.g., "Text | Company | Location | Feb 2025 – May 2025")
          let mainHeaderText = entry.header;
          let dateRange = null;
          let actualBullets = entry.bullets;
          
          // Check for date range in header: "Feb 2025 – May 2025" or "2025 – 2025" or "Feb 2025 - May 2025"
          const dateRangePattern = /(.+?)\s+((\d{4}|\w+\s+\d{4})\s*[–\-]\s*(\d{4}|\w+\s+\d{4}|Present|Current))$/;
          const dateRangeMatch = entry.header.match(dateRangePattern);
          
          if (dateRangeMatch) {
            // Dates are in the header - extract them and use those
            mainHeaderText = dateRangeMatch[1].trim();
            dateRange = dateRangeMatch[2].trim();
            // Don't check bullets for dates since we already have them in header
          } else {
            // No dates in header, check if first bullet is a date line (e.g., "2025 –" or "2025 - Jun Aug 2025")
            if (entry.bullets.length > 0) {
              const firstBullet = entry.bullets[0];
              const dateLinePattern = /^(\d{4}|\w+\s+\d{4})\s*[–\-]\s*(.*)$/;
              const dateLineMatch = firstBullet.match(dateLinePattern);
              
              if (dateLineMatch) {
                const startDate = dateLineMatch[1].trim();
                const endDateText = dateLineMatch[2].trim();
                if (endDateText && endDateText !== '') {
                  dateRange = startDate + ' – ' + endDateText;
                } else {
                  dateRange = startDate + ' –';
                }
                // Remove the date line from bullets so it doesn't render as a bullet
                actualBullets = entry.bullets.slice(1);
              }
            }
          }
          
          // Render the header with dates on the same line
          if (dateRange) {
            // Calculate available width for main text (leave space for date)
            const dateWidth = doc.getTextWidth(dateRange);
            const availableWidth = maxWidth - dateWidth - 10; // 10px spacing
            
            const mainLines = doc.splitTextToSize(mainHeaderText, Math.max(availableWidth, maxWidth * 0.6));
            
            // Draw main text
            doc.text(mainLines, margin, yPos);
            
            // Right-align the date range on the first line
            doc.setFont('helvetica', 'normal');
            const dateX = pageWidth - margin - dateWidth;
            doc.text(dateRange, dateX, yPos);
            
            yPos += mainLines.length * 5;
            doc.setFont('helvetica', 'bold');
          } else {
            // No date found, just render the text
            const headerLines = doc.splitTextToSize(entry.header, maxWidth);
            doc.text(headerLines, margin, yPos);
            yPos += headerLines.length * 5;
          }
          
          // Render bullets
          doc.setFont('helvetica', 'normal');
          actualBullets.forEach((bullet) => {
            if (yPos > pageHeight - 15) {
              doc.addPage();
              yPos = margin;
            }
            
            // Clean up bullet text (remove LaTeX artifacts)
            const cleanBullet = bullet.replace(/\\%/g, '%').replace(/\\&/g, '&').replace(/\\#/g, '#');
            const bulletLines = doc.splitTextToSize('• ' + cleanBullet, maxWidth - 5);
            doc.text(bulletLines, margin + 5, yPos);
            yPos += bulletLines.length * 4.5;
          });
        }
        
        yPos += 2; // Space between entries
      });
      
      yPos += 3; // Space between sections
    });
    
    return doc;
  };

  const showFeature = (featureId) => {
    const feature = features.find(f => f.id === featureId);
    setSelectedFeature(feature);
    // Reset form state when opening modal
    setFormData({});
    setResumeFile(null);
    setHasExistingResume(null);
    setGeneratedResume(null);
    setGeneratedCoverLetter(null);
    setError(null);
    setCopied(false);
    setCopiedCoverLetter(false);
    setShowSuccess(false);
    setShowCoverLetterSuccess(false);
    setChatMessages([]);
    setChatInput('');
    setChatResumeFile(null);
    setChatCoverLetterFile(null);
    setChatJobDescription('');
    setChatResumeText('');
    setChatCoverLetterText('');
  };

  const closeFeature = () => {
    setSelectedFeature(null);
    setFormData({});
    setResumeFile(null);
    setHasExistingResume(null);
    setGeneratedResume(null);
    setGeneratedCoverLetter(null);
    setError(null);
    setCopied(false);
    setCopiedCoverLetter(false);
    setShowSuccess(false);
    setShowCoverLetterSuccess(false);
    setChatMessages([]);
    setChatInput('');
    setChatResumeFile(null);
    setChatCoverLetterFile(null);
    setChatJobDescription('');
    setChatResumeText('');
    setChatCoverLetterText('');
  };

  const features = [
    {
      id: 'cv',
      title: t.cvBuilder,
      icon: FileText,
      items: t.cvItems,
      description: t.cvDesc,
      outline: {
        title: 'General Outline',
        formTitle: 'CV Builder',
        inputs: [],
        howItWorks: [
          { label: 'Personal Info', desc: 'Name, contact, LinkedIn, etc.' },
          { label: 'Education', desc: 'Schools, degrees, dates' },
          { label: 'Experience', desc: 'Jobs, internships, achievements' },
          { label: 'Skills', desc: 'Technical, soft skills, languages' },
          { label: 'Certifications & Awards', desc: 'Relevant recognitions' },
          { label: 'Export', desc: 'Download as PDF or share link' }
        ]
      }
    },
    {
      id: 'coverletter',
      title: t.coverLetter,
      icon: Mail,
      items: t.coverLetterItems,
      description: t.coverLetterDesc,
      outline: {
        title: 'General Outline',
        formTitle: 'Cover Letter Builder',
        inputs: [],
        howItWorks: [
          { label: 'Job Description', desc: 'Paste the job description you\'re applying for' },
          { label: 'Your Background', desc: 'Upload resume or provide skills and experience' },
          { label: 'AI Analysis', desc: 'AI extracts keywords and matches your background' },
          { label: 'Tailored Letter', desc: 'Generate a personalized cover letter' },
          { label: 'Download & Use', desc: 'Export as PDF or copy text' }
        ]
      }
    },
    {
      id: 'jobmatch',
      title: t.jobMatch,
      icon: Target,
      items: t.jobMatchItems,
      description: t.jobMatchDesc,
      outline: {
        title: 'General Outline',
        formTitle: 'Job Matching Platform',
        inputs: [
          { label: 'Your Skills', type: 'text', placeholder: 'e.g. Python, Marketing...' },
          { label: 'Work Type', type: 'select', options: ['Online', 'Hybrid', 'In Person'] },
          { label: 'Salary', type: 'number-salary', placeholder: 'e.g. 60000', currency: ['USD', 'CAD', 'EUR', 'GBP', 'Other'] },
          { label: 'Location', type: 'text', placeholder: 'e.g. Toronto, Remote...' }
        ],
        howItWorks: [
          { label: 'Profile Setup', desc: 'Enter skills, experience, preferences' },
          { label: 'AI Matching', desc: 'See jobs tailored to your profile' },
          { label: 'Recommendations', desc: 'Get daily/weekly job suggestions' },
          { label: 'Application Tracker', desc: 'Manage and track job applications' },
          { label: 'Notifications', desc: 'Alerts for new matches and deadlines' }
        ]
      }
    },
    {
      id: 'interview',
      title: t.interview,
      icon: Users,
      items: t.interviewItems,
      description: t.interviewDesc,
      outline: {
        title: 'General Outline',
        formTitle: 'Interview Simulator',
        inputs: [
          { label: 'Company Website', type: 'text', placeholder: 'Paste company URL...' },
          { label: 'Industry', type: 'text', placeholder: 'e.g. Technology, Finance...' },
          { label: 'Job Role', type: 'text', placeholder: 'e.g. Software Engineer, Analyst...' }
        ],
        howItWorks: [
          { label: 'Scenario Selection', desc: 'Choose industry, role, difficulty' },
          { label: 'Live Simulation', desc: 'Answer questions via text or video' },
          { label: 'Sentiment Analysis', desc: 'Real-time feedback on tone and confidence' },
          { label: 'Facial Recognition', desc: 'Analyze expressions and engagement' },
          { label: 'Tailored Questions', desc: 'AI adapts questions to your background' },
          { label: 'Industry Standards', desc: 'Benchmark answers against best practices' },
          { label: 'Summary & Feedback', desc: 'Get actionable tips for improvement' }
        ]
      }
    },
    {
      id: 'jobchatbot',
      title: t.jobChatbot,
      icon: MessageCircle,
      items: t.jobChatbotItems,
      description: t.jobChatbotDesc,
      outline: {
        title: 'General Outline',
        formTitle: 'ProLaunch AI Assistant',
        inputs: [],
        howItWorks: [
          { label: 'Upload Context', desc: 'Optionally upload resume, cover letter, or job description' },
          { label: 'Ask Questions', desc: 'Ask anything about resumes, cover letters, job descriptions, or career advice' },
          { label: 'Get Instant Answers', desc: 'Receive detailed, personalized responses' },
          { label: 'Continuous Conversation', desc: 'Have a natural conversation with context' }
        ]
      }
    }
  ];

  return (
    <div>
      <div className="mb-10">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">{t.personalTrack}</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8">{t.description}</p>
        </div>

        {/* Features Section */}
        <div id="features" className="mb-10">
          <div className="bg-white/5 backdrop-blur border border-gray-800 rounded-2xl p-8 mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">{t.features}</h2>
            <p className="text-gray-400 mb-6">{t.focusedTools}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <button
                  key={feature.id}
                  onClick={() => showFeature(feature.id)}
                  className="bg-white/5 border border-gray-800 rounded-2xl p-6 text-left hover:bg-white/10 transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                  <ul className="space-y-2">
                    {feature.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                        <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          </div>

          {/* Privacy Section */}
          <div className="bg-white/5 backdrop-blur border border-gray-800 rounded-2xl p-8 text-center">
            <Shield className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">{t.privacyFirst}</h3>
            <p className="text-gray-400">
              {t.privacyDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Feature Modal */}
      {selectedFeature && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeFeature}>
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl max-w-6xl w-full max-h-[85vh] overflow-y-auto border border-gray-800 relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeFeature}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full transition-all z-10"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <div className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-white mb-2">{selectedFeature.title}</h2>
                <p className="text-gray-400">{selectedFeature.description}</p>
              </div>

              {selectedFeature.id === 'coverletter' ? (
                <div className="space-y-6">
                  <div className="bg-gray-900/50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 text-center">Cover Letter Builder</h3>
                    
                    <form onSubmit={handleCoverLetterSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Job Description <span className="text-red-400">*</span>
                        </label>
                        <textarea
                          value={formData.jobDescription || ''}
                          onChange={(e) => handleInputChange('jobDescription', e.target.value)}
                          placeholder="Paste the job description here..."
                          className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 min-h-[150px]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Upload Resume (Optional)
                        </label>
                        <input
                          type="file"
                          accept=".txt,.pdf"
                          onChange={handleFileChange}
                          className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-2 text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/20 file:text-emerald-400 hover:file:bg-emerald-500/30"
                        />
                        <p className="mt-2 text-xs text-gray-400">Supported formats: .txt, .pdf</p>
                        {resumeFile && (
                          <p className="mt-2 text-sm text-emerald-400">✓ {resumeFile.name}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Your Name <span className="text-gray-500">(optional)</span>
                        </label>
                        <input
                          type="text"
                          value={formData.name || ''}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Your full name"
                          className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Skills <span className="text-gray-500">(optional)</span>
                        </label>
                        <textarea
                          value={formData.skills || ''}
                          onChange={(e) => handleInputChange('skills', e.target.value)}
                          placeholder="e.g. Python, Communication, Excel, Project Management..."
                          className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 min-h-[80px]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Experience <span className="text-gray-500">(optional)</span>
                        </label>
                        <textarea
                          value={formData.experience || ''}
                          onChange={(e) => handleInputChange('experience', e.target.value)}
                          placeholder="Briefly describe your relevant work experience, projects, or achievements..."
                          className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 min-h-[100px]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Education <span className="text-gray-500">(optional)</span>
                        </label>
                        <textarea
                          value={formData.education || ''}
                          onChange={(e) => handleInputChange('education', e.target.value)}
                          placeholder="List your education: institution, degree, major, graduation date, relevant coursework, honors, etc..."
                          className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 min-h-[100px]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Additional Information <span className="text-gray-500">(optional)</span>
                        </label>
                        <textarea
                          value={formData.additionalInfo || ''}
                          onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                          placeholder="Any additional information you'd like to include (certifications, awards, etc.)..."
                          className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 min-h-[80px]"
                        />
                      </div>

                      {error && (
                        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4">
                          <p className="text-red-400 text-sm">{error}</p>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold py-3 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Generating Cover Letter...</span>
                          </>
                        ) : (
                          'Generate Cover Letter'
                        )}
                      </button>
                    </form>
                  </div>

                  {generatedCoverLetter && (
                    <div id="cover-letter-download-section" className={`bg-gray-900/50 rounded-2xl p-6 ${showCoverLetterSuccess ? 'border-2 border-emerald-500/50 animate-pulse' : 'border border-gray-800'}`}>
                      <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-xl p-3 mb-4 flex items-center gap-2">
                        <Check className="w-5 h-5 text-emerald-400" />
                        <p className="text-emerald-400 font-semibold">✓ Cover letter generated successfully! Download your tailored PDF below.</p>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-white">Generated Cover Letter</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={handleCopyCoverLetter}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white text-sm transition-all flex items-center gap-2"
                          >
                            {copiedCoverLetter ? (
                              <>
                                <Check className="w-4 h-4" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={handleCoverLetterDownloadDOCX}
                            disabled={isLoading}
                            className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-lg text-blue-400 text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Generating...</span>
                              </>
                            ) : (
                              <>
                                <FileText className="w-4 h-4" />
                                <span>Download DOCX</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={handleCoverLetterDownload}
                            disabled={isLoading}
                            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Generating PDF...</span>
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4" />
                                <span>Download PDF</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="bg-black/50 rounded-xl p-4 max-h-[400px] overflow-y-auto">
                        <pre className="text-white text-sm whitespace-pre-wrap font-mono">{generatedCoverLetter}</pre>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-900/50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 text-center">How It Works</h3>
                    <ul className="space-y-3">
                      {selectedFeature.outline.howItWorks.map((step, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="text-emerald-400 font-bold flex-shrink-0">•</span>
                          <div>
                            <strong className="text-white">{step.label}:</strong>
                            <span className="text-gray-300 ml-2">{step.desc}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : selectedFeature.id === 'cv' ? (
                <div className="space-y-6">
                  <div className="bg-gray-900/50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 text-center">CV Builder</h3>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Job Description
                        </label>
                        <textarea
                          value={formData.jobDescription || ''}
                          onChange={(e) => handleInputChange('jobDescription', e.target.value)}
                          placeholder="Paste the job description here..."
                          className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 min-h-[120px]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          Do you have an existing resume?
                        </label>
                        <div className="flex gap-4 mb-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="hasResume"
                              value="yes"
                              checked={hasExistingResume === true}
                              onChange={() => setHasExistingResume(true)}
                              className="w-4 h-4 text-emerald-500 bg-white/5 border-gray-700 focus:ring-emerald-500"
                            />
                            <span className="text-gray-300">Yes</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="hasResume"
                              value="no"
                              checked={hasExistingResume === false}
                              onChange={() => setHasExistingResume(false)}
                              className="w-4 h-4 text-emerald-500 bg-white/5 border-gray-700 focus:ring-emerald-500"
                            />
                            <span className="text-gray-300">No</span>
                          </label>
                        </div>
                      </div>

                      {hasExistingResume === true && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-300 mb-2">Upload Resume</label>
                          <input
                            type="file"
                            accept=".txt,.pdf"
                            onChange={handleFileChange}
                            className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-2 text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/20 file:text-emerald-400 hover:file:bg-emerald-500/30"
                          />
                          <p className="mt-2 text-xs text-gray-400">Supported formats: .txt, .pdf</p>
                          {resumeFile && (
                            <p className="mt-2 text-sm text-emerald-400">✓ {resumeFile.name}</p>
                          )}
                        </div>
                      )}

                      {hasExistingResume === false && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Name <span className="text-gray-500">(optional)</span>
                            </label>
                            <input
                              type="text"
                              value={formData.name || ''}
                              onChange={(e) => handleInputChange('name', e.target.value)}
                              placeholder="Your full name"
                              className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Phone <span className="text-gray-500">(optional)</span>
                            </label>
                            <input
                              type="text"
                              value={formData.phone || ''}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              placeholder="Your phone number"
                              className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Email <span className="text-gray-500">(optional)</span>
                            </label>
                            <input
                              type="email"
                              value={formData.email || ''}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              placeholder="your.email@example.com"
                              className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              LinkedIn <span className="text-gray-500">(optional)</span>
                            </label>
                            <input
                              type="text"
                              value={formData.linkedin || ''}
                              onChange={(e) => handleInputChange('linkedin', e.target.value)}
                              placeholder="linkedin.com/in/yourprofile"
                              className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Skills <span className="text-red-400">*</span>
                            </label>
                            <textarea
                              value={formData.skills || ''}
                              onChange={(e) => handleInputChange('skills', e.target.value)}
                              placeholder="e.g. Python, Communication, Excel, Project Management..."
                              className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 min-h-[80px]"
                              required={hasExistingResume === false}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Professional Experience <span className="text-red-400">*</span>
                            </label>
                            <textarea
                              value={formData.professionalExperience || ''}
                              onChange={(e) => handleInputChange('professionalExperience', e.target.value)}
                              placeholder="List your work experience, internships, etc. Include company name, position, dates, and key responsibilities..."
                              className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 min-h-[120px]"
                              required={hasExistingResume === false}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Personal Projects
                            </label>
                            <textarea
                              value={formData.personalProjects || ''}
                              onChange={(e) => handleInputChange('personalProjects', e.target.value)}
                              placeholder="List any relevant projects you've worked on..."
                              className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 min-h-[100px]"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Education <span className="text-red-400">*</span>
                            </label>
                            <textarea
                              value={formData.education || ''}
                              onChange={(e) => handleInputChange('education', e.target.value)}
                              placeholder="List your education: institution, degree, major, graduation date..."
                              className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 min-h-[100px]"
                              required={hasExistingResume === false}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Miscellaneous (Awards, Certifications, etc.)
                            </label>
                            <textarea
                              value={formData.miscInfo || ''}
                              onChange={(e) => handleInputChange('miscInfo', e.target.value)}
                              placeholder="Any awards, certifications, publications, volunteer work, etc..."
                              className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 min-h-[100px]"
                            />
                          </div>
                        </div>
                      )}

                      {hasExistingResume === true && (
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Skills (optional - to add relevant skills from job description)
                          </label>
                          <textarea
                            value={formData.skills || ''}
                            onChange={(e) => handleInputChange('skills', e.target.value)}
                            placeholder="Additional skills or skills from the job description you want to highlight..."
                            className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 min-h-[80px]"
                          />
                        </div>
                      )}

                      {error && (
                        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4">
                          <p className="text-red-400 text-sm">{error}</p>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold py-3 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Tailoring Resume...</span>
                          </>
                        ) : (
                          'Tailor My CV'
                        )}
                      </button>
                    </form>
                  </div>

                  {generatedResume && (
                    <div id="download-section" className={`bg-gray-900/50 rounded-2xl p-6 ${showSuccess ? 'border-2 border-emerald-500/50 animate-pulse' : 'border border-gray-800'}`}>
                      <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-xl p-3 mb-4 flex items-center gap-2">
                        <Check className="w-5 h-5 text-emerald-400" />
                        <p className="text-emerald-400 font-semibold">✓ Resume generated successfully! Download your tailored PDF below.</p>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-white">Generated Resume</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={handleCopy}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white text-sm transition-all flex items-center gap-2"
                          >
                            {copied ? (
                              <>
                                <Check className="w-4 h-4" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={handleDownload}
                            disabled={isLoading}
                            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Generating PDF...</span>
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4" />
                                <span>Download PDF</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="bg-black/50 rounded-xl p-4 max-h-[400px] overflow-y-auto">
                        <pre className="text-white text-sm whitespace-pre-wrap font-mono">{generatedResume}</pre>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-900/50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 text-center">How It Works</h3>
                    <ul className="space-y-3">
                      {selectedFeature.outline.howItWorks.map((step, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="text-emerald-400 font-bold flex-shrink-0">•</span>
                          <div>
                            <strong className="text-white">{step.label}:</strong>
                            <span className="text-gray-300 ml-2">{step.desc}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : selectedFeature.id !== 'jobchatbot' ? (
                <div className="bg-gray-900/50 rounded-2xl p-6 mb-6">
                  <h3 className="text-xl font-bold text-white mb-4 text-center">{selectedFeature.outline.formTitle}</h3>
                  
                  <form className="space-y-4">
                    {selectedFeature.outline.inputs.map((input, i) => (
                      <div key={i}>
                        <label className="block text-sm font-medium text-gray-300 mb-2">{input.label}</label>
                        {input.type === 'file' ? (
                          <input
                            type="file"
                            className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-2 text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/20 file:text-emerald-400 hover:file:bg-emerald-500/30"
                          />
                        ) : input.type === 'select' ? (
                          <select className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20">
                            {input.options.map((option, j) => (
                              <option key={j} value={option} className="bg-gray-900">{option}</option>
                            ))}
                          </select>
                        ) : input.type === 'number-salary' ? (
                          <div className="flex gap-2">
                            <input
                              type="number"
                              placeholder={input.placeholder}
                              className="flex-1 bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                            />
                            <select className="w-32 bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20">
                              {input.currency.map((curr, j) => (
                                <option key={j} value={curr} className="bg-gray-900">{curr}</option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <input
                            type={input.type}
                            placeholder={input.placeholder}
                            className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                          />
                        )}
                        {input.items && (
                          <ul className="mt-2 space-y-1">
                            {input.items.map((item, j) => (
                              <li key={j} className="text-sm text-gray-400">• {item}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={(e) => e.preventDefault()}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold py-3 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all"
                    >
                      {selectedFeature.outline.formTitle.includes('CV') ? 'Tailor My CV' : selectedFeature.outline.formTitle.includes('Interview') ? 'Start Simulation' : 'Find Jobs'}
                    </button>
                  </form>
                </div>
              ) : null}

              {selectedFeature.id === 'jobchatbot' ? (
                <div className="space-y-6">
                  <div className="bg-gray-900/50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 text-center">ProLaunch AI Assistant</h3>
                    
                    {/* Context Upload Section */}
                    <div className="mb-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Upload Resume (Optional)
                        </label>
                        <input
                          type="file"
                          accept=".txt,.pdf"
                          onChange={handleChatResumeFileChange}
                          className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-2 text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/20 file:text-emerald-400 hover:file:bg-emerald-500/30"
                        />
                        {chatResumeFile && (
                          <p className="mt-2 text-sm text-emerald-400">✓ {chatResumeFile.name}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Upload Cover Letter (Optional - .txt only)
                        </label>
                        <input
                          type="file"
                          accept=".txt"
                          onChange={handleChatCoverLetterFileChange}
                          className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-2 text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/20 file:text-emerald-400 hover:file:bg-emerald-500/30"
                        />
                        {chatCoverLetterFile && (
                          <p className="mt-2 text-sm text-emerald-400">✓ {chatCoverLetterFile.name}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Job Description (Optional)
                        </label>
                        <textarea
                          value={chatJobDescription}
                          onChange={(e) => setChatJobDescription(e.target.value)}
                          placeholder="Paste a job description here for context..."
                          className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 min-h-[100px]"
                        />
                      </div>
                    </div>

                    {/* Chat Interface */}
                    <div className="bg-black/50 rounded-xl p-4 mb-4" style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
                      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                        {chatMessages.length === 0 ? (
                          <div className="text-center text-gray-400 mt-8">
                            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Ask me anything about resumes, cover letters, job descriptions, or career advice!</p>
                            <p className="text-sm mt-2">You can upload your resume or cover letter above for personalized feedback.</p>
                          </div>
                        ) : (
                          chatMessages.map((msg, idx) => (
                            <div
                              key={idx}
                              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                  msg.role === 'user'
                                    ? 'bg-emerald-500/20 text-emerald-100'
                                    : 'bg-white/5 text-gray-200'
                                }`}
                              >
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                              </div>
                            </div>
                          ))
                        )}
                        {isLoading && (
                          <div className="flex justify-start">
                            <div className="bg-white/5 text-gray-200 rounded-lg px-4 py-2">
                              <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                              <span className="text-sm">Thinking...</span>
                            </div>
                          </div>
                        )}
                        <div ref={chatMessagesEndRef} />
                      </div>
                      <form onSubmit={handleChatSubmit} className="flex gap-2">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Ask a question..."
                          className="flex-1 bg-white/5 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                          disabled={isLoading}
                        />
                        <button
                          type="submit"
                          disabled={isLoading || !chatInput.trim()}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </form>
                    </div>

                    {error && (
                      <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4">
                        <p className="text-red-400 text-sm">{error}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : selectedFeature.id !== 'cv' && selectedFeature.id !== 'coverletter' && selectedFeature.id !== 'jobchatbot' && (
                <div className="bg-gray-900/50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 text-center">How It Works</h3>
                  <ul className="space-y-3">
                    {selectedFeature.outline.howItWorks.map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-emerald-400 font-bold flex-shrink-0">•</span>
                        <div>
                          <strong className="text-white">{step.label}:</strong>
                          <span className="text-gray-300 ml-2">{step.desc}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerTrack;
