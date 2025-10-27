import * as pdfParse from 'pdf-parse';
import type { Resume } from '@shared/schema';
import { nanoid } from 'nanoid';

export async function parsePDFToResume(buffer: Buffer): Promise<Resume> {
  const data = await pdfParse(buffer);
  const text = data.text;
  
  // Basic information extraction using regex patterns
  const emailPattern = /[\w.-]+@[\w.-]+\.\w+/;
  const phonePattern = /(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/;
  const linkedinPattern = /linkedin\.com\/in\/[\w-]+/;
  const websitePattern = /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/\S*)?/;
  
  const email = text.match(emailPattern)?.[0] || '';
  const phone = text.match(phonePattern)?.[0] || '';
  const linkedin = text.match(linkedinPattern)?.[0] || '';
  const website = text.match(websitePattern)?.[0] || '';

  // Extract name (assuming it's in the first few lines)
  const firstLines = text.split('\n').slice(0, 3);
  const possibleName = firstLines.find(line => 
    line.length > 0 && 
    !line.includes('@') && 
    !line.match(phonePattern) &&
    !line.includes('http')
  ) || '';

  // Create basic resume structure
  const resume: Resume = {
    personalInfo: {
      fullName: possibleName.trim(),
      email,
      phone,
      location: '',  // Location requires more complex extraction
      linkedin,
      website,
    },
    summary: '',
    experience: [],
    education: [],
    skills: [
      {
        id: nanoid(),
        category: 'Technical Skills',
        skills: []
      }
    ]
  };

  return resume;
}