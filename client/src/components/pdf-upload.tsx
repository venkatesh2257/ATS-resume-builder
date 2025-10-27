import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Resume } from "@shared/schema";

interface PDFUploadProps {
  onResumeLoad: (resume: Resume) => void;
  isLoading?: boolean;
}

export function PDFUpload({ onResumeLoad, isLoading }: PDFUploadProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid File",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("pdf", file);

      const response = await fetch("/api/parse-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || "Failed to parse PDF";
        throw new Error(errorMessage);
      }

      const resumeData = await response.json();
      onResumeLoad(resumeData.resume);
      
      toast({
        title: "PDF Uploaded",
        description: "Resume has been successfully parsed",
      });
    } catch (error: any) {
      console.error("PDF upload error:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to parse PDF",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileUpload}
        className="hidden"
        id="pdf-upload"
        disabled={uploading || isLoading}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => document.getElementById("pdf-upload")?.click()}
        disabled={uploading || isLoading}
      >
        <Upload className="w-4 h-4 mr-2" />
        Upload Resume
      </Button>
    </div>
  );
}