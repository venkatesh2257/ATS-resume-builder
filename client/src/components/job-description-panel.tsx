import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle2, XCircle } from "lucide-react";
import type { Keyword } from "@shared/schema";

interface JobDescriptionPanelProps {
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
  keywords?: Keyword[];
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export function JobDescriptionPanel({
  jobDescription,
  onJobDescriptionChange,
  keywords = [], // Provide default empty array
  onAnalyze,
  isAnalyzing,
}: JobDescriptionPanelProps) {
  // Only calculate stats if we have keywords
  const matchedCount = keywords?.filter(k => k.matched)?.length || 0;
  const totalCount = keywords?.length || 0;
  const matchPercentage = totalCount > 0 ? Math.round((matchedCount / totalCount) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 h-full">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg font-semibold">Job Description</CardTitle>
          <CardDescription>Paste the job description to analyze and optimize your resume</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4">
          <div className="flex-1 flex flex-col">
            <Textarea
              placeholder="Paste the complete job description here..."
              value={jobDescription}
              onChange={(e) => onJobDescriptionChange(e.target.value)}
              className="flex-1 resize-none font-sans text-sm min-h-[200px]"
              data-testid="input-job-description"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">
                {jobDescription.length} characters
              </span>
            </div>
          </div>
          
          <Button
            onClick={onAnalyze}
            disabled={jobDescription.length < 10 || isAnalyzing}
            className="w-full"
            data-testid="button-analyze"
            title={jobDescription.length < 10 ? "Enter at least 10 characters in job description" : "Analyze keywords and calculate ATS score"}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isAnalyzing ? "Analyzing..." : "Analyze Keywords"}
          </Button>
        </CardContent>
      </Card>

      {keywords.length > 0 && (
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Extracted Keywords</CardTitle>
              <Badge variant="secondary" className="font-mono text-xs">
                {matchPercentage}% Match
              </Badge>
            </div>
            <CardDescription>
              {matchedCount} of {totalCount} keywords found in your resume
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, idx) => (
                <Badge
                  key={idx}
                  variant={keyword.matched ? "default" : "outline"}
                  className="gap-1 text-xs"
                  data-testid={`badge-keyword-${idx}`}
                >
                  {keyword.matched ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : (
                    <XCircle className="w-3 h-3" />
                  )}
                  {keyword.keyword}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
