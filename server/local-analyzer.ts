import type { Resume } from "@shared/schema";

// Common tech skills and categories
const SKILL_PATTERNS = {
  programming: [
    "javascript", "typescript", "python", "java", "c++", "c#", "ruby", "php", "swift", "kotlin",
    "react", "angular", "vue", "node", "express", "django", "flask", "spring", "asp.net",
    "html", "css", "sass", "less", "webpack", "vite", "babel", "docker", "kubernetes",
    "aws", "azure", "gcp", "firebase", "mongodb", "mysql", "postgresql", "redis", "graphql",
    "rest", "api", "git", "github", "gitlab", "ci/cd", "jenkins", "travis", "circle"
  ],
  soft_skills: [
    "communication", "teamwork", "leadership", "problem solving", "analytical",
    "time management", "organization", "creativity", "adaptability", "flexibility",
    "project management", "critical thinking", "attention to detail", "collaboration"
  ],
  tools: [
    "vscode", "intellij", "eclipse", "xcode", "android studio", "postman", "jira",
    "confluence", "slack", "teams", "office", "photoshop", "figma", "sketch"
  ]
};

function extractKeywords(text: string) {
  const keywords: Array<{ keyword: string; category: string; importance: string; matched?: boolean }> = [];
  const lowercaseText = text.toLowerCase();

  // Extract programming skills
  SKILL_PATTERNS.programming.forEach(skill => {
    if (lowercaseText.includes(skill.toLowerCase())) {
      keywords.push({
        keyword: skill,
        category: "skill",
        importance: "high"
      });
    }
  });

  // Extract soft skills
  SKILL_PATTERNS.soft_skills.forEach(skill => {
    if (lowercaseText.includes(skill.toLowerCase())) {
      keywords.push({
        keyword: skill,
        category: "skill",
        importance: "medium"
      });
    }
  });

  // Extract tool mentions
  SKILL_PATTERNS.tools.forEach(tool => {
    if (lowercaseText.includes(tool.toLowerCase())) {
      keywords.push({
        keyword: tool,
        category: "skill",
        importance: "medium"
      });
    }
  });

  // Extract education-related keywords
  const educationKeywords = ["degree", "bachelor", "master", "phd", "certification", "diploma"];
  educationKeywords.forEach(edu => {
    if (lowercaseText.includes(edu.toLowerCase())) {
      keywords.push({
        keyword: edu,
        category: "education",
        importance: "high"
      });
    }
  });

  // Extract experience-related patterns
  const experiencePatterns = [
    "years of experience",
    "year experience",
    "years experience",
    "professional experience",
    "worked with",
    "responsible for",
    "led",
    "managed",
    "developed",
    "implemented",
    "created"
  ];

  experiencePatterns.forEach(pattern => {
    if (lowercaseText.includes(pattern.toLowerCase())) {
      keywords.push({
        keyword: pattern,
        category: "experience",
        importance: "high"
      });
    }
  });

  return keywords;
}

function calculateScore(resume: Resume, keywords: any[]) {
  const resumeText = JSON.stringify(resume).toLowerCase();
  const totalKeywords = keywords.length || 0;

  // Mark keywords as matched/unmatched and collect lists
  const matchedKeywordsList: string[] = [];
  const missingKeywordsList: string[] = [];

  keywords.forEach((keyword) => {
    const isMatched = resumeText.includes(keyword.keyword.toLowerCase());
    keyword.matched = isMatched;
    if (isMatched) matchedKeywordsList.push(keyword.keyword);
    else missingKeywordsList.push(keyword.keyword);
  });

  const matchedCount = matchedKeywordsList.length;
  const keywordMatchScore = totalKeywords > 0 ? Math.round((matchedCount / totalKeywords) * 100) : 0;

  // Format score: check presence of personal info fields
  const personal = (resume as any)?.personalInfo || {};
  const hasFullName = !!personal.fullName;
  const hasEmail = !!personal.email;
  const hasPhone = !!personal.phone;
  const formatScore = hasFullName && hasEmail && hasPhone ? 100 : hasFullName && hasEmail ? 70 : 40;

  // Section completeness: simple heuristic based on presence of sections
  const sectionsPresent = [
    !!(resume as any)?.summary,
    Array.isArray((resume as any)?.experience) && (resume as any).experience.length > 0,
    Array.isArray((resume as any)?.education) && (resume as any).education.length > 0,
    Array.isArray((resume as any)?.skills) && (resume as any).skills.length > 0,
  ].filter(Boolean).length;
  const sectionCompletenessScore = Math.round((sectionsPresent / 4) * 100);

  // Overall score: weighted average
  const overallScore = Math.round((keywordMatchScore * 0.6) + (formatScore * 0.25) + (sectionCompletenessScore * 0.15));

  return {
    overallScore,
    keywordMatchScore,
    formatScore,
    sectionCompletenessScore,
    keywords,
    suggestions: missingKeywordsList.map(k => `Consider adding experience or skills related to "${k}"`),
    matchedKeywords: matchedKeywordsList,
    missingKeywords: missingKeywordsList,
  };
}

export { extractKeywords, calculateScore };