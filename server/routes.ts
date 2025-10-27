import type { Express } from "express";
import { createServer, type Server } from "http";
import { generatePDF, generateDocx } from "./export";
import { handlePDFUpload } from "./pdf-handler";
import {
  resumeSchema,
  exportRequestSchema,
  type Keyword,
  type Resume,
} from "@shared/schema";
import { z } from "zod";
import { extractKeywords, calculateScore } from "./local-analyzer";

const analyzeRequestSchema = z.object({
  jobDescription: z.string().min(10, "Job description must be at least 10 characters"),
  resume: resumeSchema,
});

const optimizeRequestSchema = z.object({
  jobDescription: z.string().min(10, "Job description must be at least 10 characters"),
  currentResume: resumeSchema.optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/parse-pdf", handlePDFUpload);
  app.post("/api/analyze", async (req, res) => {
    try {
      const validationResult = analyzeRequestSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: validationResult.error.errors 
        });
      }

      const { jobDescription, resume } = validationResult.data;

      // Extract keywords using local implementation
      const keywords = extractKeywords(jobDescription);
      const analysis = calculateScore(resume, keywords);

      // Log response for debugging
      console.log('Analyze response:', {
        keywordsCount: Array.isArray(keywords) ? keywords.length : 0,
        sampleKeyword: Array.isArray(keywords) && keywords[0] ? keywords[0] : null,
        analysis
      });

      res.json({ keywords, analysis });
    } catch (error: any) {
      console.error("Analysis error:", error);
      
      // Handle OpenAI API errors specifically
      if (error?.status === 429) {
        return res.status(429).json({ 
          message: "OpenAI API rate limit exceeded. Please try again later or upgrade your API plan.",
          details: error.message
        });
      }
      
      // Handle other OpenAI errors
      if (error?.status) {
        return res.status(error.status).json({ 
          message: `OpenAI API error: ${error.message}`,
          details: error.message
        });
      }
      
      res.status(500).json({ message: error.message || "Failed to analyze resume" });
    }
  });

  app.post("/api/optimize", async (req, res) => {
    try {
      const validationResult = optimizeRequestSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: validationResult.error.errors 
        });
      }

      const { jobDescription, currentResume } = validationResult.data;

      // For now, we'll return suggestions based on missing keywords
      const keywords = extractKeywords(jobDescription);
      const analysis = calculateScore(currentResume || {}, keywords);
      
      // Create basic suggestions based on unmatched keywords
      const suggestions = keywords
        .filter(k => !k.matched)
        .map(k => `Consider adding experience or skills related to "${k.keyword}"`);

      // Return the current resume with suggestions
      const optimizedResume = currentResume || {};
      
      res.json({ 
        resume: optimizedResume,
        analysis,
        suggestions,
        keywords
      });
    } catch (error: any) {
      console.error("Optimization error:", error);
      res.status(500).json({ message: error.message || "Failed to optimize resume" });
    }
  });

  app.post("/api/export", async (req, res) => {
    try {
      const validationResult = exportRequestSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: validationResult.error.errors 
        });
      }

      const { resume, format } = validationResult.data;

      if (format === "pdf") {
        const pdfBuffer = await generatePDF(resume);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=resume-${Date.now()}.pdf`);
        res.send(pdfBuffer);
      } else if (format === "docx") {
        const docxBuffer = await generateDocx(resume);
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        res.setHeader("Content-Disposition", `attachment; filename=resume-${Date.now()}.docx`);
        res.send(docxBuffer);
      } else {
        res.status(400).json({ message: "Invalid format. Use 'pdf' or 'docx'" });
      }
    } catch (error: any) {
      console.error("Export error:", error);
      res.status(500).json({ message: error.message || "Failed to export resume" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
