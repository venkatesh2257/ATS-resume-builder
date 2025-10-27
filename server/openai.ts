import OpenAI from "openai";
import type { Resume } from "@shared/schema";
import { z } from "zod";
import * as dotenv from 'dotenv';

// Load environment variables before initializing OpenAI
dotenv.config();

// Referenced from javascript_openai blueprint
// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user

let openai: OpenAI | null = null;

try {
  console.log('Initializing OpenAI with env:', { 
    hasKey: !!process.env.OPENAI_API_KEY,
    keyLength: process.env.OPENAI_API_KEY?.length
  });
  
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    console.log('OpenAI client initialized successfully');
  } else {
    console.warn("⚠️  OPENAI_API_KEY not found. AI features will not work.");
    console.warn("   Set OPENAI_API_KEY in your Replit Secrets or .env file");
  }
} catch (error: any) {
  console.error("Failed to initialize OpenAI:", {
    error: error.message,
    status: error.status,
    statusCode: error.statusCode,
    code: error.code
  });
}

const keywordResponseSchema = z.object({
  keywords: z.array(z.object({
    keyword: z.string(),
    category: z.enum(["skill", "experience", "education", "certification", "general"]),
    importance: z.enum(["high", "medium", "low"]),
  })),
});

export async function extractKeywords(jobDescription: string): Promise<any[]> {
  if (!openai) {
    throw new Error("OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.");
  }
  
  try {
    console.log('Making OpenAI API request...');
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0613", // Using a specific version that's stable and widely available
      max_tokens: 1000,
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: `You are an ATS (Applicant Tracking System) expert. Extract key keywords from job descriptions and categorize them. Return JSON in this exact format: { "keywords": [{ "keyword": "string", "category": "skill" | "experience" | "education" | "certification" | "general", "importance": "high" | "medium" | "low" }] }`,
        },
        {
          role: "user",
          content: `Extract keywords from this job description:\n\n${jobDescription}`,
        },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 2048,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    const validated = keywordResponseSchema.safeParse(result);
    
    if (!validated.success) {
      console.error("OpenAI keyword response validation failed:", validated.error);
      return [];
    }
    
    return validated.data.keywords;
  } catch (error: any) {
    console.error("Keyword extraction error:", error);
    throw new Error("Failed to extract keywords: " + error.message);
  }
}

export async function optimizeResume(jobDescription: string, currentResume?: Resume): Promise<Resume> {
  if (!openai) {
    throw new Error("OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.");
  }
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are a professional resume writer specializing in ATS optimization. Your goal is to create resumes with 92%+ ATS compatibility. Focus on:
1. Incorporating relevant keywords from the job description naturally
2. Using action verbs and quantifiable achievements
3. Maintaining ATS-friendly formatting (no tables, columns, or complex layouts)
4. Optimizing section order and content for the specific role
5. Ensuring all critical skills and requirements are addressed

Return JSON with the complete optimized resume matching this structure: {
  "personalInfo": { "fullName": "", "email": "", "phone": "", "location": "", "linkedin": "", "website": "" },
  "summary": "",
  "experience": [{ "id": "", "company": "", "position": "", "location": "", "startDate": "", "endDate": "", "current": false, "responsibilities": [] }],
  "education": [{ "id": "", "institution": "", "degree": "", "field": "", "location": "", "graduationDate": "", "gpa": "" }],
  "skills": [{ "id": "", "category": "", "skills": [] }]
}

IMPORTANT: Preserve existing personal information, company names, dates, and education details. Only enhance wording and add missing keywords.`,
        },
        {
          role: "user",
          content: `Job Description:\n${jobDescription}\n\n${currentResume ? `Current Resume:\n${JSON.stringify(currentResume, null, 2)}\n\nOptimize this resume for the job description while maintaining all personal information.` : 'Generate a template resume optimized for this job description with placeholder information.'}`,
        },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 4096,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    const resumeSchema = await import("@shared/schema").then(m => m.resumeSchema);
    const validated = resumeSchema.safeParse(result);
    
    if (!validated.success) {
      console.error("OpenAI resume response validation failed:", validated.error);
      throw new Error("Generated resume does not match required structure");
    }
    
    return validated.data;
  } catch (error: any) {
    console.error("Resume optimization error:", error);
    throw new Error("Failed to optimize resume: " + error.message);
  }
}

const atsScoreSchema = z.object({
  overallScore: z.number().min(0).max(100),
  keywordMatchScore: z.number().min(0).max(100),
  formatScore: z.number().min(0).max(100),
  sectionCompletenessScore: z.number().min(0).max(100),
  matchedKeywords: z.array(z.string()),
  missingKeywords: z.array(z.string()),
  suggestions: z.array(z.string()),
});

const suggestionsResponseSchema = z.object({
  suggestions: z.array(z.string()),
});

export async function calculateATSScore(resume: Resume, keywords: any[]): Promise<any> {
  try {
    const resumeText = JSON.stringify(resume).toLowerCase();
    const keywordsList = keywords.map(k => k.keyword?.toLowerCase() || "").filter(Boolean);
    
    const matchedKeywords: string[] = [];
    const missingKeywords: string[] = [];
    
    keywordsList.forEach(keyword => {
      if (resumeText.includes(keyword)) {
        matchedKeywords.push(keyword);
      } else {
        missingKeywords.push(keyword);
      }
    });
    
    const keywordMatchScore = keywordsList.length > 0 
      ? Math.round((matchedKeywords.length / keywordsList.length) * 100) 
      : 0;
    
    let formatScore = 100;
    
    let sectionCompletenessScore = 0;
    if (resume.personalInfo.fullName && resume.personalInfo.email && resume.personalInfo.phone) {
      sectionCompletenessScore += 20;
    }
    if (resume.summary && resume.summary.length > 20) {
      sectionCompletenessScore += 20;
    }
    if (resume.experience.length > 0) {
      sectionCompletenessScore += 30;
    }
    if (resume.education.length > 0) {
      sectionCompletenessScore += 15;
    }
    if (resume.skills.length > 0) {
      sectionCompletenessScore += 15;
    }
    
    const overallScore = Math.round(
      keywordMatchScore * 0.5 + 
      formatScore * 0.25 + 
      sectionCompletenessScore * 0.25
    );
    
    let suggestions: string[] = [
      "Add more relevant keywords from the job description",
      "Include quantifiable achievements in your experience",
      "Ensure all sections are complete with detailed information"
    ];

    try {
      if (!openai) {
        // If OpenAI is not available, use default suggestions
        throw new Error("OpenAI not configured");
      }
      
      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: `You are an ATS expert providing actionable suggestions. Based on the keyword analysis, provide 3-5 specific suggestions to improve the resume's ATS score. Return JSON: { "suggestions": ["string"] }`,
          },
          {
            role: "user",
            content: `Resume has ${matchedKeywords.length}/${keywordsList.length} keywords matched. Missing: ${missingKeywords.slice(0, 10).join(", ")}. Provide improvement suggestions.`,
          },
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 1024,
      });

      const aiResult = JSON.parse(response.choices[0].message.content || "{}");
      const validated = suggestionsResponseSchema.safeParse(aiResult);
      
      if (validated.success && validated.data.suggestions.length > 0) {
        suggestions = validated.data.suggestions.slice(0, 5);
      }
    } catch (suggestionError) {
      console.error("Failed to get AI suggestions, using defaults:", suggestionError);
    }

    const analysis = {
      overallScore,
      keywordMatchScore,
      formatScore,
      sectionCompletenessScore,
      matchedKeywords: matchedKeywords.slice(0, 20),
      missingKeywords: missingKeywords.slice(0, 20),
      suggestions,
    };

    return analysis;
  } catch (error: any) {
    console.error("ATS score calculation error:", error);
    throw new Error("Failed to calculate ATS score: " + error.message);
  }
}
