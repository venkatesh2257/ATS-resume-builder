import type { Resume } from '@shared/schema';
import { nanoid } from 'nanoid';

export async function parsePDFToResume(buffer: Buffer): Promise<Resume> {
  try {
    console.log('🚀 Starting PDF parsing...');

    // ✅ Multiple approaches for PDF parsing
    let extractedText = '';
    let parseSuccess = false;

    // Method 1: Try pdf-parse
    try {
      const pdfParseModule = await import('pdf-parse');
      const pdfParse = (pdfParseModule as any).default || pdfParseModule;
      
      if (typeof pdfParse === 'function') {
  const data = await pdfParse(buffer);
        extractedText = data.text || '';
        console.log('📄 PDF text extracted via pdf-parse, length:', extractedText.length);
        parseSuccess = true;
      }
    } catch (pdfParseError) {
      console.warn('pdf-parse failed:', pdfParseError);
    }

    // Method 2: Try pdfjs-dist as fallback
    if (!parseSuccess || extractedText.length < 10) {
      try {
        console.log('🔄 Trying pdfjs-dist as fallback...');
        const pdfjsLib = await import('pdfjs-dist');
        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
        
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += pageText + '\n';
        }
        
        extractedText = fullText;
        console.log('📄 PDF text extracted via pdfjs-dist, length:', extractedText.length);
        parseSuccess = true;
      } catch (pdfjsError) {
        console.warn('pdfjs-dist failed:', pdfjsError);
      }
    }

    // If both methods failed, create fallback
    if (!parseSuccess || !extractedText || extractedText.trim().length < 10) {
      console.log('🔍 PDF parsing failed with all methods');
      console.log('📝 Creating fallback resume structure for manual input');
      return createFallbackResume();
    }

    // Clean and normalize the extracted text
    extractedText = extractedText.replace(/\s+/g, ' ').trim();
    console.log('📝 Cleaned text length:', extractedText.length);

    // ✉️ Enhanced regex patterns for better info extraction
    const emailPattern = /[\w.-]+@[\w.-]+\.\w+/g;
    const phonePattern = /(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g;
    const linkedinPattern = /linkedin\.com\/in\/[\w-]+/gi;
    const websitePattern = /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/\S*)?/g;

    // Extract all matches and take the first one
    const email = extractedText.match(emailPattern)?.[0] || '';
    const phone = extractedText.match(phonePattern)?.[0] || '';
    const linkedin = extractedText.match(linkedinPattern)?.[0] || '';
    const website = extractedText.match(websitePattern)?.[0] || '';

    console.log('🔍 Extracted contact info:', { email, phone, linkedin, website });

    // 👤 Enhanced name extraction - try multiple approaches
    const lines = extractedText.split('\n').filter((line: string) => line.trim().length > 0);
    
    // Method 1: Look for name in first few lines
    let possibleName = lines.find((line: string) => {
      const trimmed = line.trim();
      return trimmed.length > 2 &&
        trimmed.length < 50 &&
        !trimmed.includes('@') &&
        !trimmed.match(phonePattern) &&
        !trimmed.includes('http') &&
        !trimmed.toLowerCase().includes('resume') &&
        !trimmed.toLowerCase().includes('curriculum') &&
        !trimmed.toLowerCase().includes('experience') &&
        !trimmed.toLowerCase().includes('education') &&
        !trimmed.toLowerCase().includes('skills') &&
        !trimmed.match(/^\d+/) && // Doesn't start with number
        !trimmed.match(/^[A-Z\s]+$/) && // Not all caps
        trimmed.split(' ').length >= 2; // Has at least 2 words
    }) || '';

    // Method 2: If no name found, try looking for capitalized words
    if (!possibleName) {
      const capitalizedLines = lines.filter(line => {
        const words = line.trim().split(' ');
        return words.length >= 2 && words.length <= 4 &&
               words.every(word => /^[A-Z][a-z]+$/.test(word));
      });
      possibleName = capitalizedLines[0] || '';
    }

    // Method 3: Extract from email if available
    if (!possibleName && email) {
      const emailName = email.split('@')[0];
      possibleName = emailName.replace(/[._-]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }

    console.log('👤 Name extraction result:', possibleName);

    // 📍 Enhanced location detection
    const locationPatterns = [
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*[A-Z]{2}(?:\s+\d{5})?)/,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*[A-Z][a-z]+)/,
      /([A-Z][a-z]+,\s*[A-Z]{2})/
    ];
    
    let location = '';
    for (const pattern of locationPatterns) {
      const match = extractedText.match(pattern);
      if (match) {
        location = match[0];
        break;
      }
    }

    // 🎓 Basic education extraction
    const educationPattern = /(?:university|college|institute|school|bachelor|master|phd|degree|diploma|certificate)/gi;
    const educationMatches = extractedText.match(educationPattern);
    
    // 💼 Basic experience extraction
    const experiencePattern = /(?:experience|work|employment|job|position|company|role)/gi;
    const experienceMatches = extractedText.match(experiencePattern);

    console.log('✅ Extracted Data:', {
      name: possibleName.trim(),
      email,
      phone,
      location,
      linkedin,
      website,
      educationFound: educationMatches?.length || 0,
      experienceFound: experienceMatches?.length || 0
    });

    // 📝 Enhanced summary extraction
    let summary = '';
    
    // Look for common summary/objective keywords
    const summaryKeywords = ['summary', 'objective', 'profile', 'about', 'overview', 'introduction'];
    const summaryIndex = lines.findIndex(line => 
      summaryKeywords.some(keyword => 
        line.toLowerCase().includes(keyword)
      )
    );
    
    if (summaryIndex !== -1) {
      // Extract text after summary keyword
      const summaryLines = lines.slice(summaryIndex, summaryIndex + 3);
      summary = summaryLines.join(' ').replace(/^(summary|objective|profile|about|overview|introduction):?\s*/i, '').trim();
    } else {
      // Fallback: use first substantial paragraph
      const firstParagraph = lines.find(line => line.trim().length > 50);
      summary = firstParagraph ? firstParagraph.substring(0, 200) + '...' : '';
    }

    console.log('📝 Summary extracted:', summary.substring(0, 100) + '...');

    // 🧾 Build a Resume object with extracted data (ensure schema compliance)
    const resume: Resume = {
      personalInfo: {
        fullName: possibleName.trim() || 'Resume Uploaded - Please Enter Name',
        email: email || 'resume@example.com',
        phone: phone || 'Please enter your phone',
        location: location || 'Please enter your location',
        linkedin: linkedin || '',
        website: website || ''
      },
      summary: summary || 'Please enter your professional summary',
      experience: [],
      education: [],
      skills: [
        {
          id: nanoid(),
          category: 'Technical Skills',
          skills: ['Please add your skills']
        }
      ]
    };

    console.log('🎉 Resume structure created successfully');
    return resume;

  } catch (error: any) {
    console.error('❌ PDF parsing error:', error);
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
}

// Fallback resume for scanned PDFs when OCR is not available
function createFallbackResume(): Resume {
  console.log('📝 Creating fallback resume structure');
  
  return {
    personalInfo: {
      fullName: 'Resume Uploaded - Please Enter Name',
      email: 'resume@example.com',
      phone: 'Please enter your phone',
      location: 'Please enter your location',
      linkedin: '',
      website: ''
    },
    summary: 'Please enter your professional summary',
    experience: [],
    education: [],
    skills: [
      {
        id: nanoid(),
        category: 'Technical Skills',
        skills: ['Please add your skills']
      }
    ]
  };
}

