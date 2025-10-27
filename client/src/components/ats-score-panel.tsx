import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Lightbulb } from "lucide-react";
import type { ATSAnalysis } from "@shared/schema";

interface ATSScorePanelProps {
  analysis: ATSAnalysis | null;
  isLoading: boolean;
}

export function ATSScorePanel({ analysis, isLoading }: ATSScorePanelProps) {
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">ATS Analysis</CardTitle>
          <CardDescription>Analyzing your resume...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center h-48">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-8 border-muted animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-muted-foreground">...</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">ATS Analysis</CardTitle>
          <CardDescription>Your ATS score will appear here</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center h-48 text-center gap-3">
            <div className="w-32 h-32 rounded-full border-8 border-muted flex items-center justify-center">
              <span className="text-4xl font-bold text-muted-foreground">--</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Paste a job description and add your information to see your ATS compatibility score
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 dark:text-green-400";
    if (score >= 75) return "text-blue-600 dark:text-blue-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 92) return "Excellent";
    if (score >= 75) return "Good";
    if (score >= 60) return "Fair";
    return "Needs Work";
  };

  const getBorderColor = (score: number) => {
    if (score >= 90) return "border-green-500";
    if (score >= 75) return "border-blue-500";
    if (score >= 60) return "border-yellow-500";
    return "border-red-500";
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">ATS Analysis</CardTitle>
        <CardDescription>Your resume compatibility score</CardDescription>
      </CardHeader>
  <CardContent className="space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className={`relative w-40 h-40 rounded-full border-8 ${getBorderColor(analysis.overallScore)} flex items-center justify-center`}>
            <div className="text-center">
              <div className={`text-5xl font-bold font-mono ${getScoreColor(analysis.overallScore ?? 0)}`} data-testid="text-ats-score">
                {Math.round(analysis.overallScore ?? 0)}
              </div>
              <div className="text-xs text-muted-foreground font-semibold">/ 100</div>
            </div>
          </div>
          <Badge variant={analysis.overallScore >= 92 ? "default" : "secondary"} className="text-sm font-semibold">
            {getScoreLabel(analysis.overallScore)}
          </Badge>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Keyword Match</span>
              <span className="font-mono text-xs">{Math.round(analysis.keywordMatchScore ?? 0)}%</span>
            </div>
            <Progress value={analysis.keywordMatchScore ?? 0} className="h-2" data-testid="progress-keyword-match" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Format Quality</span>
              <span className="font-mono text-xs">{Math.round(analysis.formatScore ?? 0)}%</span>
            </div>
            <Progress value={analysis.formatScore ?? 0} className="h-2" data-testid="progress-format" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Section Completeness</span>
              <span className="font-mono text-xs">{Math.round(analysis.sectionCompletenessScore ?? 0)}%</span>
            </div>
            <Progress value={analysis.sectionCompletenessScore ?? 0} className="h-2" data-testid="progress-completeness" />
          </div>
        </div>

        {(analysis.suggestions?.length || 0) > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Lightbulb className="w-4 h-4 text-primary" />
              <span>Suggestions</span>
            </div>
            <ul className="space-y-2">
              {analysis.suggestions?.slice(0, 5).map((suggestion, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {(analysis.missingKeywords?.length || 0) > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <div className="text-sm font-semibold">Missing Keywords</div>
            <div className="flex flex-wrap gap-2">
              {analysis.missingKeywords?.slice(0, 8).map((keyword, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
