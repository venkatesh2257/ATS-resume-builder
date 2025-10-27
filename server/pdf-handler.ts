import formidable from 'formidable';
import { type NextFunction, type Request, type Response } from 'express';
import { extractKeywords, calculateScore } from './local-analyzer';
import { parsePDFToResume } from './pdf-parser';
import { resumeSchema } from '@shared/schema';
import path from 'path';

// Helper to parse form data
const parseFormData = async (req: Request): Promise<{ fields: any, files: any }> => {
  const form = formidable();
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};

// Middleware to handle file uploads
export async function handlePDFUpload(req: Request, res: Response, next: NextFunction) {
  try {
    // Configure formidable
    const uploadDir = path.join(__dirname, 'uploads');
    const form = formidable({
      uploadDir,
      keepExtensions: true,
      filter: (part) => part.mimetype === 'application/pdf'
    });

    // Parse the uploaded file
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const pdfFile = files.pdf?.[0];
    
    if (!pdfFile) {
      return res.status(400).json({ message: "No PDF file uploaded" });
    }

    // Parse PDF to text and extract resume data
    const buffer = await require('fs').promises.readFile(pdfFile.filepath);
    const resumeData = await parsePDFToResume(buffer);
    
    // Validate the extracted resume data
    const validationResult = resumeSchema.safeParse(resumeData);
    if (!validationResult.success) {
      return res.status(400).json({
        message: "Failed to parse PDF content",
        errors: validationResult.error.errors
      });
    }

    res.json({ 
      resume: validationResult.data,
      message: "PDF successfully parsed"
    });
  } catch (error: any) {
    console.error("PDF parsing error:", error);
    res.status(500).json({ message: error.message || "Failed to process PDF" });
  }
}