import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Download, FileText } from "lucide-react";
import type { Resume, Experience, Education, Skill } from "@shared/schema";
import { nanoid } from "nanoid";
import { PDFUpload } from "./pdf-upload";

interface ResumeEditorProps {
  resume: Resume;
  onResumeChange: (resume: Resume) => void;
  onExport: (format: "pdf" | "docx") => void;
  isExporting: boolean;
}

export function ResumeEditor({ resume, onResumeChange, onExport, isExporting }: ResumeEditorProps) {
  const updatePersonalInfo = (field: string, value: string) => {
    onResumeChange({
      ...resume,
      personalInfo: { ...resume.personalInfo, [field]: value },
    });
  };

  const addExperience = () => {
    const newExp: Experience = {
      id: nanoid(),
      company: "",
      position: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      responsibilities: [],
    };
    onResumeChange({
      ...resume,
      experience: [...resume.experience, newExp],
    });
  };

  const updateExperience = (id: string, field: string, value: any) => {
    onResumeChange({
      ...resume,
      experience: resume.experience.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    });
  };

  const removeExperience = (id: string) => {
    onResumeChange({
      ...resume,
      experience: resume.experience.filter(exp => exp.id !== id),
    });
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: nanoid(),
      institution: "",
      degree: "",
      field: "",
      location: "",
      graduationDate: "",
      gpa: "",
    };
    onResumeChange({
      ...resume,
      education: [...resume.education, newEdu],
    });
  };

  const updateEducation = (id: string, field: string, value: string) => {
    onResumeChange({
      ...resume,
      education: resume.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    });
  };

  const removeEducation = (id: string) => {
    onResumeChange({
      ...resume,
      education: resume.education.filter(edu => edu.id !== id),
    });
  };

  const addSkillCategory = () => {
    const newSkill: Skill = {
      id: nanoid(),
      category: "",
      skills: [],
    };
    onResumeChange({
      ...resume,
      skills: [...resume.skills, newSkill],
    });
  };

  const updateSkillCategory = (id: string, category: string) => {
    onResumeChange({
      ...resume,
      skills: resume.skills.map(skill =>
        skill.id === id ? { ...skill, category } : skill
      ),
    });
  };

  const updateSkills = (id: string, skillsText: string) => {
    onResumeChange({
      ...resume,
      skills: resume.skills.map(skill =>
        skill.id === id
          ? { ...skill, skills: skillsText.split(",").map(s => s.trim()).filter(Boolean) }
          : skill
      ),
    });
  };

  const removeSkillCategory = (id: string) => {
    onResumeChange({
      ...resume,
      skills: resume.skills.filter(skill => skill.id !== id),
    });
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">Resume Builder</CardTitle>
          <div className="flex gap-2">
            <PDFUpload onResumeLoad={onResumeChange} isLoading={isExporting} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport("pdf")}
              disabled={isExporting}
              data-testid="button-export-pdf"
            >
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport("docx")}
              disabled={isExporting}
              data-testid="button-export-docx"
            >
              <FileText className="w-4 h-4 mr-2" />
              Word
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card className="flex-1 overflow-hidden">
        <Tabs defaultValue="personal" className="h-full flex flex-col">
          <CardHeader className="pb-3">
            <TabsList className="grid w-full grid-cols-5 h-auto">
              <TabsTrigger value="personal" className="text-xs sm:text-sm" data-testid="tab-personal">Personal</TabsTrigger>
              <TabsTrigger value="summary" className="text-xs sm:text-sm" data-testid="tab-summary">Summary</TabsTrigger>
              <TabsTrigger value="experience" className="text-xs sm:text-sm" data-testid="tab-experience">Experience</TabsTrigger>
              <TabsTrigger value="education" className="text-xs sm:text-sm" data-testid="tab-education">Education</TabsTrigger>
              <TabsTrigger value="skills" className="text-xs sm:text-sm" data-testid="tab-skills">Skills</TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto">
            <TabsContent value="personal" className="space-y-4 mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={resume.personalInfo.fullName}
                    onChange={(e) => updatePersonalInfo("fullName", e.target.value)}
                    placeholder="John Doe"
                    data-testid="input-fullname"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={resume.personalInfo.email}
                    onChange={(e) => updatePersonalInfo("email", e.target.value)}
                    placeholder="john@example.com"
                    data-testid="input-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={resume.personalInfo.phone}
                    onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    data-testid="input-phone"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={resume.personalInfo.location}
                    onChange={(e) => updatePersonalInfo("location", e.target.value)}
                    placeholder="San Francisco, CA"
                    data-testid="input-location"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={resume.personalInfo.linkedin || ""}
                    onChange={(e) => updatePersonalInfo("linkedin", e.target.value)}
                    placeholder="linkedin.com/in/johndoe"
                    data-testid="input-linkedin"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={resume.personalInfo.website || ""}
                    onChange={(e) => updatePersonalInfo("website", e.target.value)}
                    placeholder="johndoe.com"
                    data-testid="input-website"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="summary" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="summary">Professional Summary</Label>
                <Textarea
                  id="summary"
                  value={resume.summary || ""}
                  onChange={(e) => onResumeChange({ ...resume, summary: e.target.value })}
                  placeholder="A brief summary highlighting your key qualifications and career goals..."
                  className="min-h-[200px]"
                  data-testid="input-summary"
                />
              </div>
            </TabsContent>

            <TabsContent value="experience" className="space-y-4 mt-0">
              {resume.experience.map((exp, idx) => (
                <Card key={exp.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-base font-semibold">Experience {idx + 1}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeExperience(exp.id)}
                      data-testid={`button-remove-experience-${idx}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Company *</Label>
                        <Input
                          value={exp.company}
                          onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                          placeholder="Acme Inc."
                          data-testid={`input-company-${idx}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Position *</Label>
                        <Input
                          value={exp.position}
                          onChange={(e) => updateExperience(exp.id, "position", e.target.value)}
                          placeholder="Software Engineer"
                          data-testid={`input-position-${idx}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Location</Label>
                        <Input
                          value={exp.location || ""}
                          onChange={(e) => updateExperience(exp.id, "location", e.target.value)}
                          placeholder="Remote"
                          data-testid={`input-exp-location-${idx}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Start Date *</Label>
                        <Input
                          value={exp.startDate}
                          onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)}
                          placeholder="Jan 2020"
                          data-testid={`input-start-date-${idx}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <Input
                          value={exp.endDate || ""}
                          onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)}
                          placeholder="Present"
                          disabled={exp.current}
                          data-testid={`input-end-date-${idx}`}
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-6">
                        <input
                          type="checkbox"
                          id={`current-${exp.id}`}
                          checked={exp.current}
                          onChange={(e) => updateExperience(exp.id, "current", e.target.checked)}
                          className="rounded"
                          data-testid={`checkbox-current-${idx}`}
                        />
                        <Label htmlFor={`current-${exp.id}`}>Currently working here</Label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Responsibilities (one per line)</Label>
                      <Textarea
                        value={exp.responsibilities.join("\n")}
                        onChange={(e) => updateExperience(exp.id, "responsibilities", e.target.value.split("\n").filter(Boolean))}
                        placeholder="• Led team of 5 developers&#10;• Improved performance by 40%"
                        className="min-h-[100px]"
                        data-testid={`input-responsibilities-${idx}`}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button onClick={addExperience} variant="outline" className="w-full" data-testid="button-add-experience">
                <Plus className="w-4 h-4 mr-2" />
                Add Experience
              </Button>
            </TabsContent>

            <TabsContent value="education" className="space-y-4 mt-0">
              {resume.education.map((edu, idx) => (
                <Card key={edu.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-base font-semibold">Education {idx + 1}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEducation(edu.id)}
                      data-testid={`button-remove-education-${idx}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Institution *</Label>
                        <Input
                          value={edu.institution}
                          onChange={(e) => updateEducation(edu.id, "institution", e.target.value)}
                          placeholder="University of California"
                          data-testid={`input-institution-${idx}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Degree *</Label>
                        <Input
                          value={edu.degree}
                          onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                          placeholder="Bachelor of Science"
                          data-testid={`input-degree-${idx}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Field of Study *</Label>
                        <Input
                          value={edu.field}
                          onChange={(e) => updateEducation(edu.id, "field", e.target.value)}
                          placeholder="Computer Science"
                          data-testid={`input-field-${idx}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Location</Label>
                        <Input
                          value={edu.location || ""}
                          onChange={(e) => updateEducation(edu.id, "location", e.target.value)}
                          placeholder="Berkeley, CA"
                          data-testid={`input-edu-location-${idx}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Graduation Date</Label>
                        <Input
                          value={edu.graduationDate || ""}
                          onChange={(e) => updateEducation(edu.id, "graduationDate", e.target.value)}
                          placeholder="May 2020"
                          data-testid={`input-graduation-date-${idx}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>GPA</Label>
                        <Input
                          value={edu.gpa || ""}
                          onChange={(e) => updateEducation(edu.id, "gpa", e.target.value)}
                          placeholder="3.8/4.0"
                          data-testid={`input-gpa-${idx}`}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button onClick={addEducation} variant="outline" className="w-full" data-testid="button-add-education">
                <Plus className="w-4 h-4 mr-2" />
                Add Education
              </Button>
            </TabsContent>

            <TabsContent value="skills" className="space-y-4 mt-0">
              {resume.skills.map((skill, idx) => (
                <Card key={skill.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-base font-semibold">Skill Category {idx + 1}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSkillCategory(skill.id)}
                      data-testid={`button-remove-skill-${idx}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Category *</Label>
                      <Input
                        value={skill.category}
                        onChange={(e) => updateSkillCategory(skill.id, e.target.value)}
                        placeholder="Programming Languages"
                        data-testid={`input-skill-category-${idx}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Skills (comma-separated) *</Label>
                      <Input
                        value={skill.skills.join(", ")}
                        onChange={(e) => updateSkills(skill.id, e.target.value)}
                        placeholder="JavaScript, TypeScript, React, Node.js"
                        data-testid={`input-skills-${idx}`}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button onClick={addSkillCategory} variant="outline" className="w-full" data-testid="button-add-skill">
                <Plus className="w-4 h-4 mr-2" />
                Add Skill Category
              </Button>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
