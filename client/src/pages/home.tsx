import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { JobDescriptionPanel } from "@/components/job-description-panel";
import { ResumeEditor } from "@/components/resume-editor";
import { ATSScorePanel } from "@/components/ats-score-panel";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Resume, ATSAnalysis, Keyword } from "@shared/schema";
import { FileText } from "lucide-react";
import { nanoid } from "nanoid";

export default function Home() {
  const { toast } = useToast();
  const [jobDescription, setJobDescription] = useState("");
  const [keywords, setKeywords] = useState<Keyword[]>([]); // Initialize with empty array
  const [resume, setResume] = useState<Resume>({
    personalInfo: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      website: "",
    },
    summary: "",
    experience: [],
    education: [],
    skills: [],
  });

  const [atsAnalysis, setAtsAnalysis] = useState<ATSAnalysis | null>(null);
  const [shouldAnalyze, setShouldAnalyze] = useState(false);

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      console.log("Analyzing resume with job description length:", jobDescription.length);
      console.log("Resume valid?", isResumeValid());
      const response = await apiRequest("POST", "/api/analyze", {
        jobDescription,
        resume,
      });
      // Ensure response has the expected shape
      if (!response || !Array.isArray(response.keywords)) {
        throw new Error("Invalid response format from server");
      }
      return response;
    },
    onSuccess: (data: { keywords: Keyword[]; analysis: ATSAnalysis }) => {
      console.log("Analysis success:", data);
  setKeywords(data.keywords || []); // Ensure we always set an array
      setAtsAnalysis(data.analysis);
      toast({
        title: "Analysis Complete",
        description: `ATS Score: ${Math.round(data.analysis.overallScore)}%`,
      });
    },
    onError: (error: Error) => {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const optimizeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/optimize", {
        jobDescription,
        currentResume: resume,
      });
      return response;
    },
    onSuccess: (data: { resume: Resume; analysis: ATSAnalysis }) => {
      setResume(data.resume);
      setAtsAnalysis(data.analysis);
      toast({
        title: "Resume Optimized",
        description: "Your resume has been optimized for the job description",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Optimization Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const exportMutation = useMutation({
    mutationFn: async (format: "pdf" | "docx") => {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, format }),
      });
      
      if (!response.ok) {
        throw new Error("Export failed");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resume-${Date.now()}.${format === "pdf" ? "pdf" : "docx"}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: (_, format) => {
      toast({
        title: "Export Successful",
        description: `Resume downloaded as ${format.toUpperCase()}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isResumeValid = () => {
    return (
      resume.personalInfo.fullName &&
      resume.personalInfo.email &&
      resume.personalInfo.phone &&
      resume.personalInfo.location
    );
  };

  const handleAnalyze = () => {
    if (jobDescription.length >= 10 && isResumeValid()) {
      analyzeMutation.mutate();
    }
  };

  useEffect(() => {
    if (!jobDescription || jobDescription.length < 10) return;
    if (!isResumeValid()) return;

    const timer = setTimeout(() => {
      analyzeMutation.mutate();
    }, 1000);

    return () => clearTimeout(timer);
  }, [resume, jobDescription]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-semibold">AI Resume Builder</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-120px)]">
          <div className="lg:col-span-3 overflow-y-auto">
            <JobDescriptionPanel
              jobDescription={jobDescription}
              onJobDescriptionChange={setJobDescription}
              keywords={keywords}
              onAnalyze={handleAnalyze}
              isAnalyzing={analyzeMutation.isPending}
            />
          </div>

          <div className="lg:col-span-6 overflow-y-auto">
            <ResumeEditor
              resume={resume}
              onResumeChange={setResume}
              onExport={(format) => exportMutation.mutate(format)}
              isExporting={exportMutation.isPending}
            />
          </div>

          <div className="lg:col-span-3 overflow-y-auto">
            <ATSScorePanel
              analysis={atsAnalysis}
              isLoading={analyzeMutation.isPending}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
