import { z } from "zod";

// Resume section schemas
export const personalInfoSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  location: z.string().min(1, "Location is required"),
  linkedin: z.string().optional(),
  website: z.string().optional(),
});

export const experienceSchema = z.object({
  id: z.string(),
  company: z.string().min(1, "Company name is required"),
  position: z.string().min(1, "Position is required"),
  location: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  responsibilities: z.array(z.string()).default([]),
});

export const educationSchema = z.object({
  id: z.string(),
  institution: z.string().min(1, "Institution is required"),
  degree: z.string().min(1, "Degree is required"),
  field: z.string().min(1, "Field of study is required"),
  location: z.string().optional(),
  graduationDate: z.string().optional(),
  gpa: z.string().optional(),
});

export const skillSchema = z.object({
  id: z.string(),
  category: z.string().min(1, "Category is required"),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
});

export const resumeSchema = z.object({
  personalInfo: personalInfoSchema,
  summary: z.string().optional(),
  experience: z.array(experienceSchema).default([]),
  education: z.array(educationSchema).default([]),
  skills: z.array(skillSchema).default([]),
});

// Job description analysis
export const jobDescriptionSchema = z.object({
  description: z.string().min(10, "Job description must be at least 10 characters"),
});

export const keywordSchema = z.object({
  keyword: z.string(),
  category: z.enum(["skill", "experience", "education", "certification", "general"]),
  matched: z.boolean(),
  importance: z.enum(["high", "medium", "low"]),
});

export const atsAnalysisSchema = z.object({
  overallScore: z.number().min(0).max(100),
  keywordMatchScore: z.number().min(0).max(100),
  formatScore: z.number().min(0).max(100),
  sectionCompletenessScore: z.number().min(0).max(100),
  keywords: z.array(keywordSchema),
  suggestions: z.array(z.string()),
  matchedKeywords: z.array(z.string()),
  missingKeywords: z.array(z.string()),
});

export const optimizeResumeRequestSchema = z.object({
  jobDescription: z.string().min(10),
  currentResume: resumeSchema.optional(),
});

export const exportRequestSchema = z.object({
  resume: resumeSchema,
  format: z.enum(["pdf", "docx"]),
});

// TypeScript types
export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type Resume = z.infer<typeof resumeSchema>;
export type JobDescription = z.infer<typeof jobDescriptionSchema>;
export type Keyword = z.infer<typeof keywordSchema>;
export type ATSAnalysis = z.infer<typeof atsAnalysisSchema>;
export type OptimizeResumeRequest = z.infer<typeof optimizeResumeRequestSchema>;
export type ExportRequest = z.infer<typeof exportRequestSchema>;
