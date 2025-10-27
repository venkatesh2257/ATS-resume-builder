import formidable from 'formidable';
import { type NextFunction, type Request, type Response } from 'express';
import { extractKeywords, calculateScore } from './local-analyzer';
import { parsePDFToResume } from './pdf-parser';
import { resumeSchema } from '@shared/schema';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to fix common validation issues
function fixResumeData(data: any): any {
  const fixed = { ...data };
  
  // Ensure personalInfo exists and has required fields
  if (!fixed.personalInfo) {
    fixed.personalInfo = {};
  }
  
  // Fix required fields with valid defaults
  if (!fixed.personalInfo.fullName || fixed.personalInfo.fullName.trim() === '') {
    fixed.personalInfo.fullName = 'Resume Uploaded - Please Enter Name';
  }
  
  if (!fixed.personalInfo.email || !fixed.personalInfo.email.includes('@')) {
    fixed.personalInfo.email = 'resume@example.com';
  }
  
  if (!fixed.personalInfo.phone || fixed.personalInfo.phone.trim() === '') {
    fixed.personalInfo.phone = 'Please enter your phone';
  }
  
  if (!fixed.personalInfo.location || fixed.personalInfo.location.trim() === '') {
    fixed.personalInfo.location = 'Please enter your location';
  }
  
  // Ensure arrays exist
  if (!Array.isArray(fixed.experience)) {
    fixed.experience = [];
  }
  
  if (!Array.isArray(fixed.education)) {
    fixed.education = [];
  }
  
  if (!Array.isArray(fixed.skills)) {
    fixed.skills = [{
      id: 'default-skill',
      category: 'Technical Skills',
      skills: ['Please add your skills']
    }];
  }
  
  return fixed;
}

// Helper to parse form data
const parseFormData = async (req: Request): Promise<{ fields: any, files: any }> => {
  const form = formidable();
  return new Promise((resolve, reject) => {
    form.parse(req, (err: any, fields: any, files: any) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};

// Middleware to handle file uploads
export async function handlePDFUpload(req: Request, res: Response, next: NextFunction) {
  let pdfFile: any = null;
  try {
    // Configure formidable
    const uploadDir = path.join(__dirname, 'uploads');
    
    // Ensure uploads directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const form = formidable({
      uploadDir,
      keepExtensions: true,
      filter: (part: any) => part.mimetype === 'application/pdf'
    });

    // Parse the uploaded file
    const [fields, files] = await new Promise<[any, any]>((resolve, reject) => {
      form.parse(req, (err: any, fields: any, files: any) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    pdfFile = (files as any).pdf?.[0];
    
    if (!pdfFile) {
      return res.status(400).json({ message: "No PDF file uploaded" });
    }

    // Parse PDF to text and extract resume data
    const buffer = await fs.promises.readFile(pdfFile.filepath);
    const resumeData = await parsePDFToResume(buffer);
    
    // Validate the extracted resume data
    const validationResult = resumeSchema.safeParse(resumeData);
    if (!validationResult.success) {
      console.error('Schema validation failed:', validationResult.error.errors);
      console.error('Extracted data:', JSON.stringify(resumeData, null, 2));
      
      // Try to fix common validation issues
      const fixedResumeData = fixResumeData(resumeData);
      const fixedValidationResult = resumeSchema.safeParse(fixedResumeData);
      
      if (fixedValidationResult.success) {
        console.log('✅ Fixed validation issues, using corrected data');
        res.json({ 
          resume: fixedValidationResult.data,
          message: "PDF successfully parsed and corrected"
        });
        return;
      }
      
      return res.status(400).json({
        message: "Failed to parse PDF content - validation error",
        errors: validationResult.error.errors,
        extractedData: resumeData // Include extracted data for debugging
      });
    }

    res.json({ 
      resume: validationResult.data,
      message: "PDF successfully parsed"
    });
    
    // Clean up temporary file
    try {
      if (pdfFile.filepath && fs.existsSync(pdfFile.filepath)) {
        fs.unlinkSync(pdfFile.filepath);
      }
    } catch (cleanupError) {
      console.warn('Failed to cleanup temporary file:', cleanupError);
    }
  } catch (error: any) {
    console.error("PDF parsing error:", error);
    
    // Clean up temporary file even on error
    try {
      if (pdfFile?.filepath && fs.existsSync(pdfFile.filepath)) {
        fs.unlinkSync(pdfFile.filepath);
      }
    } catch (cleanupError) {
      console.warn('Failed to cleanup temporary file after error:', cleanupError);
    }
    
    res.status(500).json({ message: error.message || "Failed to process PDF" });
  }
}