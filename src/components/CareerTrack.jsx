import React, { useState } from 'react';
import { FileText, Target, Users, Shield, X, Loader2, Download, Copy, Check } from 'lucide-react';
import { tailorResume, extractResumeText } from '../services/openaiService';
import jsPDF from 'jspdf';

const CareerTrack = ({ language }) => {
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [formData, setFormData] = useState({});
  const [resumeFile, setResumeFile] = useState(null);
  const [hasExistingResume, setHasExistingResume] = useState(null); // null = not selected, true = yes, false = no
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedResume, setGeneratedResume] = useState(null); // This will store plain text resume content
  const [copied, setCopied] = useState(false);
  
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
      privacyFirst: 'Confidentialité avant tout',
      privacyDesc: 'Vos informations ne sont jamais partagées. Soutenu par Firebase et AWS pour une sécurité maximale.'
    }
  };
  
  const t = careerTranslations[language] || careerTranslations.en;
  
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
        inputs: [
          { label: 'Job Description', type: 'textarea', placeholder: 'Paste job posting description or URL...' }
        ],
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
    }
  ];

  const showFeature = (featureId) => {
    const feature = features.find(f => f.id === featureId);
    setSelectedFeature(feature);
  };

  const closeFeature = () => {
    setSelectedFeature(null);
    setFormData({});
    setResumeFile(null);
    setHasExistingResume(null);
    setError(null);
    setGeneratedResume(null);
    setCopied(false);
  };

  const handleInputChange = (inputLabel, value) => {
    setFormData(prev => ({
      ...prev,
      [inputLabel]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResumeFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Only handle CV Builder for now
    if (selectedFeature?.id !== 'cv') {
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedResume(null);

    try {
      // Extract resume text from file if provided
      let resumeText = '';
      if (hasExistingResume === true && resumeFile) {
        try {
          // Show loading message for PDF extraction
          if (resumeFile.type === 'application/pdf' || resumeFile.name.endsWith('.pdf')) {
            console.log('Extracting text from PDF...');
          }
          resumeText = await extractResumeText(resumeFile);
          console.log('Resume text extracted successfully');
        } catch (extractError) {
          console.error('Error extracting text from file:', extractError);
          throw new Error(`Failed to extract text from ${resumeFile.name}: ${extractError.message}`);
        }
      }

      // Get form values
      const jobDescription = formData['Job Description'] || '';
      // Only get contact info and skills/experience/education/misc if they don't have an existing resume
      const name = hasExistingResume === false ? (formData['Name'] || '') : '';
      const phone = hasExistingResume === false ? (formData['Phone'] || '') : '';
      const email = hasExistingResume === false ? (formData['Email'] || '') : '';
      const linkedin = hasExistingResume === false ? (formData['LinkedIn'] || '') : '';
      const skills = hasExistingResume === false ? (formData['Skills'] || '') : '';
      const professionalExperience = hasExistingResume === false ? (formData['Professional Experience'] || '') : '';
      const personalProjects = hasExistingResume === false ? (formData['Personal Projects'] || '') : '';
      const education = hasExistingResume === false ? (formData['Education'] || '') : '';
      const miscInfo = hasExistingResume === false ? (formData['Misc Info'] || '') : '';

      // Call OpenAI API to tailor the resume
      const tailoredResume = await tailorResume({
        jobLink: jobDescription,
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
      });

      setGeneratedResume(tailoredResume);
    } catch (err) {
      console.error('Error tailoring resume:', err);
      setError(err.message || 'Failed to tailor resume. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedResume) {
      navigator.clipboard.writeText(generatedResume);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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

  const generatePDFFromText = (resumeText) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    let yPos = margin;
    
    doc.setFont('helvetica'); // Using helvetica for clean, professional look
    
    // Parse plain text resume into structured data
    const lines = resumeText.split('\n');
    const resume = {
      name: '',
      contact: '',
      sections: []
    };
    
    let currentSection = null;
    let currentEntry = null;
    let i = 0;
    
    // Parse header (first 2 lines)
    if (lines.length > 0) {
      const firstLine = lines[0].trim();
      // Check if it's a name (2-4 words, starts with capital letter)
      // Not a section heading, not empty, reasonable length
      if (firstLine && 
          firstLine.match(/^[A-Z][a-zA-Z\s]{2,40}$/) && 
          !firstLine.match(/^(EDUCATION|EXPERIENCE|PROFESSIONAL EXPERIENCE|PROJECTS|TECHNOLOGIES|SKILLS|SUMMARY|AWARDS|CERTIFICATIONS)$/i)) {
        resume.name = firstLine;
        i = 1;
        // Check next line for contact info
        if (lines.length > 1) {
          const secondLine = lines[1].trim();
          if (secondLine.includes('•') || secondLine.includes('@') || secondLine.includes('+') || secondLine.includes('linkedin') || secondLine.includes('http')) {
            resume.contact = secondLine;
            i = 2;
          }
        }
      }
    }
    
    // Parse sections and entries
    while (i < lines.length) {
      const line = lines[i].trim();
      
      if (line === '') {
        i++;
        continue;
      }
      
      // Check for section heading (all caps, common section names) - NO SUMMARY
      const sectionMatch = /^(EDUCATION|EXPERIENCE|PROFESSIONAL EXPERIENCE|PROJECTS|RELEVANT PROJECTS|TECHNICAL SKILLS|TECHNOLOGIES|SKILLS|AWARDS|CERTIFICATIONS|ACTIVITIES|LEADERSHIP|VOLUNTEER WORK|VOLUNTEER|PUBLICATIONS|WORK EXPERIENCE|EXTRACURRICULAR EXPERIENCE)$/i.test(line);
      
      if (sectionMatch) {
        // Save previous section
        if (currentSection) {
          if (currentEntry) {
            currentSection.entries.push(currentEntry);
            currentEntry = null;
          }
          resume.sections.push(currentSection);
        }
        
        // Start new section
        currentSection = {
          name: line.toUpperCase(),
          entries: [],
          isTechnicalSkills: /SKILLS|TECHNICAL SKILLS|TECHNOLOGIES/i.test(line)
        };
        i++;
        continue;
      }
      
      // Handle SKILLS section - format: "Category: item1, item2, item3" or "**Category:** item1, item2, item3"
      if (currentSection && currentSection.isTechnicalSkills) {
        if (line.includes(':')) {
          // Remove markdown bold formatting (**text**)
          const cleanLine = line.replace(/\*\*/g, '');
          const [category, items] = cleanLine.split(':').map(s => s.trim());
          if (!currentEntry) {
            currentEntry = {
              institution: '',
              date: '',
              title: category,
              location: '',
              bullets: items ? items.split(',').map(s => s.trim()) : [],
              isSkillCategory: true
            };
          } else {
            // Save previous entry and start new one
            currentSection.entries.push(currentEntry);
            currentEntry = {
              institution: '',
              date: '',
              title: category,
              location: '',
              bullets: items ? items.split(',').map(s => s.trim()) : [],
              isSkillCategory: true
            };
          }
        }
        i++;
        continue;
      }
      
      // Check if line has two-column format (left text with right-aligned date/GPA)
      // Pattern: "Left Text                                                      Right Text"
      const hasTwoColumnPattern = /^(.+?)\s{15,}(.+)$/.test(line);
      
      if (hasTwoColumnPattern && currentSection) {
        const match = line.match(/^(.+?)\s{15,}(.+)$/);
        const leftText = match[1].trim().replace(/\*\*/g, '');
        const rightText = match[2].trim();
        
        // Check if this is EDUCATION section (has two lines: degree/date, then institution/GPA)
        if (currentSection.name === 'EDUCATION') {
          // Save previous entry
          if (currentEntry && currentSection) {
            currentSection.entries.push(currentEntry);
          }
          
          // First line: Degree (left, bold) | Date (right, normal)
          currentEntry = {
            institution: leftText, // This will be the degree name
            date: rightText,
            title: '',
            location: '',
            bullets: [],
            isEducation: true
          };
          
          // Check next line for institution/GPA
          if (i + 1 < lines.length) {
            const nextLine = lines[i + 1].trim();
            const nextHasTwoColumn = /^(.+?)\s{15,}(.+)$/.test(nextLine);
            if (nextHasTwoColumn && !nextLine.startsWith('•')) {
              const nextMatch = nextLine.match(/^(.+?)\s{15,}(.+)$/);
              currentEntry.location = nextMatch[1].trim(); // Institution, Location
              currentEntry.title = nextMatch[2].trim(); // GPA or additional info
              i++; // Skip the next line
            }
          }
        } else {
          // For EXPERIENCE/PROJECTS: "Company, Location: Job Title" or "Project Name, Type" (left, bold) | "Date Range" (right)
          // Save previous entry
          if (currentEntry && currentSection) {
            currentSection.entries.push(currentEntry);
          }
          
          // Parse left text - could be "Company, Location: Job Title" or "Project Name, Type"
          let institution = leftText;
          let title = '';
          let location = '';
          
          if (leftText.includes(':')) {
            const parts = leftText.split(':').map(s => s.trim());
            institution = parts[0]; // "Company, Location" or "Project Name, Type"
            title = parts[1] || ''; // Job Title
          } else if (leftText.includes(',')) {
            const parts = leftText.split(',').map(s => s.trim());
            institution = parts[0];
            location = parts.slice(1).join(', ');
          } else {
            institution = leftText;
          }
          
          currentEntry = {
            institution: institution,
            date: rightText,
            title: title,
            location: location,
            bullets: []
          };
        }
        i++;
        continue;
      }
      
      // Check if line is a bullet point
      if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
        if (currentEntry) {
          const bullet = line.replace(/^[•\-\*]\s*/, '').trim();
          if (bullet) {
            currentEntry.bullets.push(bullet);
          }
        }
        i++;
        continue;
      }
      
      // Regular text - might be continuation or additional info
      if (currentEntry && line.length > 0 && !line.match(/^\d{4}/) && !sectionMatch) {
        // If we don't have a title yet, this might be it
        if (!currentEntry.title && !currentEntry.isEducation) {
          currentEntry.title = line;
        } else if (currentEntry.isEducation && !currentEntry.location) {
          // For education, this might be the institution line
          currentEntry.location = line;
        }
        i++;
        continue;
      }
      
      i++;
    }
    
    // Add last entry and section
    if (currentEntry && currentSection) {
      currentSection.entries.push(currentEntry);
    }
    if (currentSection) {
      resume.sections.push(currentSection);
    }
    
    // Second pass: Render to PDF
    const checkPageBreak = (requiredSpace = 10) => {
      if (yPos + requiredSpace > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
        return true;
      }
      return false;
    };
    
    const drawLine = () => {
      const lineWidth = maxWidth; // Full width from margin to margin
      const lineStart = margin;
      doc.setLineWidth(0.35);
      doc.line(lineStart, yPos, lineStart + lineWidth, yPos);
      yPos += 4; // Space after line before content
    };
    
    const addText = (text, size = 10, style = 'normal', x = margin, isCentered = false) => {
      if (!text || !text.trim()) return;
      
      doc.setFontSize(size);
      doc.setFont('helvetica', style);
      const textLines = doc.splitTextToSize(text, maxWidth - (x === margin ? 0 : 10));
      
      textLines.forEach((line) => {
        if (isCentered) {
          const textWidth = doc.getTextWidth(line);
          doc.text(line, (pageWidth - textWidth) / 2, yPos);
        } else {
          doc.text(line, x, yPos);
        }
        yPos += 4.5; // Reduced spacing to fit on one page
      });
    };
    
    // Render header
    if (resume.name) {
      addText(resume.name, 16, 'bold', margin, true);
      yPos += 3;
    }
    if (resume.contact) {
      addText(resume.contact, 9, 'normal', margin, true);
      yPos += 3; // Reduced space between contact and first section
    }
    
    // Render sections
    resume.sections.forEach((section) => {
      checkPageBreak(15);
      if (yPos > margin) yPos += 3; // Reduced space between sections
      
      // Section heading with line BELOW only
      addText(section.name, 11, 'bold', margin, true);
      yPos -= 2.5; // Move line closer to heading text
      drawLine(); // Line below heading
      yPos += 1; // Small space underneath the border line
      
      if (section.isTechnicalSkills) {
        // Handle SKILLS section
        section.entries.forEach((entry) => {
          if (entry.isSkillCategory) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            const categoryText = entry.title + ':';
            doc.text(categoryText, margin, yPos);
            
            // Calculate position for skills text (after category name)
            const categoryWidth = doc.getTextWidth(categoryText);
            const skillsStartX = margin + categoryWidth + 3; // 3 units spacing after colon
            
            doc.setFont('helvetica', 'normal');
            const skillsText = entry.bullets.join(', ');
            const skillsMaxWidth = maxWidth - (skillsStartX - margin);
            const skillsLines = doc.splitTextToSize(skillsText, skillsMaxWidth);
            
            skillsLines.forEach((skillLine, index) => {
              if (index === 0) {
                // First line on same line as category
                doc.text(skillLine, skillsStartX, yPos);
              } else {
                // Subsequent lines indented
                doc.text(skillLine, margin + 5, yPos);
              }
              yPos += 4.5;
            });
            yPos += 3; // Space between skill categories
          }
        });
      } else {
      
      // Render entries for EDUCATION, EXPERIENCE, PROJECTS, etc.
      section.entries.forEach((entry) => {
        checkPageBreak(15);
        
        // Handle EDUCATION format: two lines
        if (entry.isEducation) {
          // First line: Degree (bold, left) | Date (right, normal)
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text(entry.institution, margin, yPos);
          
          if (entry.date) {
            doc.setFont('helvetica', 'normal');
            const dateWidth = doc.getTextWidth(entry.date);
            doc.text(entry.date, pageWidth - margin - dateWidth, yPos);
          }
          yPos += 5;
          
          // Second line: Institution, Location (normal, left) | GPA (right, normal)
          if (entry.location) {
            doc.setFont('helvetica', 'normal');
            doc.text(entry.location, margin, yPos);
            
            if (entry.title) {
              const titleWidth = doc.getTextWidth(entry.title);
              doc.text(entry.title, pageWidth - margin - titleWidth, yPos);
            }
            yPos += 5;
          }
          yPos += 2; // Extra space within education entry
        } else {
          // For EXPERIENCE/PROJECTS: "Company, Location: Job Title" or "Project Name, Type" (bold, left) | Date (right)
          if (entry.institution) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            
            // Build the left text
            let leftText = entry.institution;
            if (entry.location) {
              leftText += ', ' + entry.location;
            }
            if (entry.title) {
              leftText += ': ' + entry.title;
            }
            
            doc.text(leftText, margin, yPos);
            
            if (entry.date) {
              doc.setFont('helvetica', 'normal');
              const dateWidth = doc.getTextWidth(entry.date);
              doc.text(entry.date, pageWidth - margin - dateWidth, yPos);
            }
            yPos += 5;
          }
        }
        
        // Bullets - more formal spacing
        entry.bullets.forEach((bullet) => {
          checkPageBreak(6);
          addText(`• ${bullet}`, 10, 'normal', margin + 5);
        });
        
        yPos += 4; // More space between entries within section
      });
      }
    });
    
    // If we have parsed data but no sections, try to render the raw text
    if (resume.sections.length === 0 && resumeText) {
      const rawLines = resumeText.split('\n');
      rawLines.forEach((line) => {
        if (line.trim()) {
          checkPageBreak(8);
          addText(line.trim(), 10, 'normal', margin);
        }
      });
    }
    
    return doc;
  };

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

              <div className="bg-gray-900/50 rounded-2xl p-6 mb-6">
                <h3 className="text-xl font-bold text-white mb-4 text-center">{selectedFeature.outline.formTitle}</h3>
                
                {!generatedResume ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {selectedFeature.outline.inputs.map((input, i) => (
                      <div key={i}>
                        <label className="block text-sm font-medium text-gray-300 mb-2">{input.label}</label>
                        {input.type === 'textarea' ? (
                          <textarea
                            placeholder={input.placeholder}
                            value={formData[input.label] || ''}
                            onChange={(e) => handleInputChange(input.label, e.target.value)}
                            rows={4}
                            className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 resize-y"
                          />
                        ) : input.type === 'select' ? (
                          <select 
                            value={formData[input.label] || ''}
                            onChange={(e) => handleInputChange(input.label, e.target.value)}
                            className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                          >
                            <option value="" className="bg-gray-900">Select an option...</option>
                            {input.options.map((option, j) => (
                              <option key={j} value={option} className="bg-gray-900">{option}</option>
                            ))}
                          </select>
                        ) : input.type === 'number-salary' ? (
                          <div className="flex gap-2">
                            <input
                              type="number"
                              placeholder={input.placeholder}
                              value={formData[input.label] || ''}
                              onChange={(e) => handleInputChange(input.label, e.target.value)}
                              className="flex-1 bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                            />
                            <select 
                              value={formData[`${input.label} Currency`] || input.currency[0]}
                              onChange={(e) => handleInputChange(`${input.label} Currency`, e.target.value)}
                              className="w-32 bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                            >
                              {input.currency.map((curr, j) => (
                                <option key={j} value={curr} className="bg-gray-900">{curr}</option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <input
                            type={input.type}
                            placeholder={input.placeholder}
                            value={formData[input.label] || ''}
                            onChange={(e) => handleInputChange(input.label, e.target.value)}
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
                    
                    {/* Resume Question - Only for CV Builder */}
                    {selectedFeature.id === 'cv' && (
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
                              onChange={() => {
                                setHasExistingResume(true);
                                setResumeFile(null);
                                // Clear form fields when switching to upload
                                setFormData(prev => {
                                  const newData = { ...prev };
                                  delete newData['Name'];
                                  delete newData['Phone'];
                                  delete newData['Email'];
                                  delete newData['LinkedIn'];
                                  delete newData['Skills'];
                                  delete newData['Professional Experience'];
                                  delete newData['Personal Projects'];
                                  delete newData['Education'];
                                  delete newData['Misc Info'];
                                  return newData;
                                });
                              }}
                              className="w-4 h-4 text-emerald-500 bg-white/5 border-gray-700 focus:ring-emerald-500 focus:ring-2"
                            />
                            <span className="text-gray-300">Yes, I have a resume</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="hasResume"
                              value="no"
                              checked={hasExistingResume === false}
                              onChange={() => {
                                setHasExistingResume(false);
                                setResumeFile(null);
                                // Clear file when switching to form fields
                              }}
                              className="w-4 h-4 text-emerald-500 bg-white/5 border-gray-700 focus:ring-emerald-500 focus:ring-2"
                            />
                            <span className="text-gray-300">No, I'll fill out the form</span>
                          </label>
                        </div>
                        
                        {/* Show file upload if they have a resume */}
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
                        
                        {/* Show form fields if they don't have a resume */}
                        {hasExistingResume === false && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                              <input
                                type="text"
                                placeholder="First Last"
                                value={formData['Name'] || ''}
                                onChange={(e) => handleInputChange('Name', e.target.value)}
                                className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                              <input
                                type="text"
                                placeholder="Phone number"
                                value={formData['Phone'] || ''}
                                onChange={(e) => handleInputChange('Phone', e.target.value)}
                                className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                              <input
                                type="email"
                                placeholder="email@example.com"
                                value={formData['Email'] || ''}
                                onChange={(e) => handleInputChange('Email', e.target.value)}
                                className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">LinkedIn</label>
                              <input
                                type="text"
                                placeholder="linkedin.com/in/username or username"
                                value={formData['LinkedIn'] || ''}
                                onChange={(e) => handleInputChange('LinkedIn', e.target.value)}
                                className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">Skills</label>
                              <textarea
                                placeholder="e.g. Python, Java, Communication, Excel, Project Management..."
                                value={formData['Skills'] || ''}
                                onChange={(e) => handleInputChange('Skills', e.target.value)}
                                rows={4}
                                className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 resize-y"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">Professional Experience</label>
                              <textarea
                                placeholder="List your work experience, internships, jobs, etc..."
                                value={formData['Professional Experience'] || ''}
                                onChange={(e) => handleInputChange('Professional Experience', e.target.value)}
                                rows={4}
                                className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 resize-y"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">Personal Projects</label>
                              <textarea
                                placeholder="List your personal projects, side projects, open source contributions, etc..."
                                value={formData['Personal Projects'] || ''}
                                onChange={(e) => handleInputChange('Personal Projects', e.target.value)}
                                rows={4}
                                className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 resize-y"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">Education</label>
                              <textarea
                                placeholder="List your education, degrees, certifications..."
                                value={formData['Education'] || ''}
                                onChange={(e) => handleInputChange('Education', e.target.value)}
                                rows={4}
                                className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 resize-y"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">Misc Info</label>
                              <textarea
                                placeholder="Any additional information, achievements, awards, etc..."
                                value={formData['Misc Info'] || ''}
                                onChange={(e) => handleInputChange('Misc Info', e.target.value)}
                                rows={4}
                                className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 resize-y"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {error && (
                      <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg">
                        {error}
                      </div>
                    )}

                    {selectedFeature.id === 'cv' && (
                      <button
                        type="submit"
                        disabled={isLoading || hasExistingResume === null || (hasExistingResume === true && !resumeFile) || (hasExistingResume === false && (!formData['Skills'] && !formData['Professional Experience'] && !formData['Personal Projects'] && !formData['Education']))}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold py-3 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Tailoring Your CV...</span>
                          </>
                        ) : (
                          'Tailor My CV'
                        )}
                      </button>
                    )}
                    
                    {selectedFeature.id !== 'cv' && (
                      <button
                        type="button"
                        onClick={(e) => e.preventDefault()}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold py-3 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all"
                      >
                        {selectedFeature.outline.formTitle.includes('Interview') ? 'Start Simulation' : 'Find Jobs'}
                      </button>
                    )}
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-white/5 border border-emerald-500/30 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-bold text-white">Your Tailored Resume</h4>
                        <div className="flex gap-2">
                          <button
                            onClick={handleCopy}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                            title="Copy to clipboard"
                          >
                            {copied ? (
                              <Check className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <Copy className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                          <button
                            onClick={handleDownload}
                            disabled={isLoading}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Download resume as PDF"
                          >
                            {isLoading ? (
                              <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                            ) : (
                              <Download className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="bg-black/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                        <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                          {generatedResume}
                        </pre>
                      </div>
                      {error && (
                        <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg">
                          {error}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setGeneratedResume(null);
                        setFormData({});
                        setResumeFile(null);
                        setError(null);
                      }}
                      className="w-full bg-white/5 border border-gray-700 text-white font-medium py-3 rounded-xl hover:bg-white/10 transition-all"
                    >
                      Create Another Resume
                    </button>
                  </div>
                )}
              </div>

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
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerTrack;

