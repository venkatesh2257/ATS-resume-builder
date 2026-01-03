import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import type { Resume } from "@shared/schema";

export async function generatePDF(resume: Resume): Promise<Buffer> {
  const doc = new jsPDF();
  let y = 20;
  const lineHeight = 7;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(resume.personalInfo.fullName, margin, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const contactInfo = [
    resume.personalInfo.email,
    resume.personalInfo.phone,
    resume.personalInfo.location,
    resume.personalInfo.linkedin,
    resume.personalInfo.website,
  ].filter(Boolean).join(" | ");
  doc.text(contactInfo, margin, y);
  y += 10;

  if (resume.summary) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Professional Summary", margin, y);
    y += lineHeight;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const summaryLines = doc.splitTextToSize(resume.summary, maxWidth);
    doc.text(summaryLines, margin, y);
    y += summaryLines.length * lineHeight + 5;
  }

  if (resume.experience.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Experience", margin, y);
    y += lineHeight;

    resume.experience.forEach((exp) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(exp.position, margin, y);
      y += lineHeight;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const expInfo = `${exp.company}${exp.location ? ` - ${exp.location}` : ""} | ${exp.startDate} - ${exp.current ? "Present" : exp.endDate || ""}`;
      doc.text(expInfo, margin, y);
      y += lineHeight;

      exp.responsibilities.forEach((resp) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        const respLines = doc.splitTextToSize(`• ${resp}`, maxWidth - 5);
        doc.text(respLines, margin + 5, y);
        y += respLines.length * lineHeight;
      });
      y += 3;
    });
  }

  if (resume.education.length > 0) {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Education", margin, y);
    y += lineHeight;

    resume.education.forEach((edu) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`${edu.degree} in ${edu.field}`, margin, y);
      y += lineHeight;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const eduInfo = `${edu.institution}${edu.location ? ` - ${edu.location}` : ""}${edu.graduationDate ? ` | ${edu.graduationDate}` : ""}${edu.gpa ? ` | GPA: ${edu.gpa}` : ""}`;
      doc.text(eduInfo, margin, y);
      y += lineHeight + 2;
    });
  }

  if (resume.skills.length > 0) {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Skills", margin, y);
    y += lineHeight;

    resume.skills.forEach((skill) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(`${skill.category}:`, margin, y);
      
      doc.setFont("helvetica", "normal");
      const skillsText = skill.skills.join(", ");
      const skillLines = doc.splitTextToSize(skillsText, maxWidth - 30);
      doc.text(skillLines, margin + 30, y);
      y += skillLines.length * lineHeight + 2;
    });
  }

  return Buffer.from(doc.output("arraybuffer"));
}

export async function generateDocx(resume: Resume): Promise<Buffer> {
  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      text: resume.personalInfo.fullName,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
    })
  );

  const contactInfo = [
    resume.personalInfo.email,
    resume.personalInfo.phone,
    resume.personalInfo.location,
    resume.personalInfo.linkedin,
    resume.personalInfo.website,
  ].filter(Boolean).join(" | ");

  children.push(
    new Paragraph({
      text: contactInfo,
      alignment: AlignmentType.CENTER,
    })
  );

  children.push(new Paragraph({ text: "" }));

  if (resume.summary) {
    children.push(
      new Paragraph({
        text: "Professional Summary",
        heading: HeadingLevel.HEADING_2,
      })
    );
    children.push(
      new Paragraph({
        text: resume.summary,
      })
    );
    children.push(new Paragraph({ text: "" }));
  }

  if (resume.experience.length > 0) {
    children.push(
      new Paragraph({
        text: "Experience",
        heading: HeadingLevel.HEADING_2,
      })
    );

    resume.experience.forEach((exp) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: exp.position,
              bold: true,
              size: 24,
            }),
          ],
        })
      );

      children.push(
        new Paragraph({
          text: `${exp.company}${exp.location ? ` - ${exp.location}` : ""} | ${exp.startDate} - ${exp.current ? "Present" : exp.endDate || ""}`,
        })
      );

      exp.responsibilities.forEach((resp) => {
        children.push(
          new Paragraph({
            text: `• ${resp}`,
          })
        );
      });

      children.push(new Paragraph({ text: "" }));
    });
  }

  if (resume.education.length > 0) {
    children.push(
      new Paragraph({
        text: "Education",
        heading: HeadingLevel.HEADING_2,
      })
    );

    resume.education.forEach((edu) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${edu.degree} in ${edu.field}`,
              bold: true,
            }),
          ],
        })
      );

      children.push(
        new Paragraph({
          text: `${edu.institution}${edu.location ? ` - ${edu.location}` : ""}${edu.graduationDate ? ` | ${edu.graduationDate}` : ""}${edu.gpa ? ` | GPA: ${edu.gpa}` : ""}`,
        })
      );

      children.push(new Paragraph({ text: "" }));
    });
  }

  if (resume.skills.length > 0) {
    children.push(
      new Paragraph({
        text: "Skills",
        heading: HeadingLevel.HEADING_2,
      })
    );

    resume.skills.forEach((skill) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${skill.category}: `,
              bold: true,
            }),
            new TextRun({
              text: skill.skills.join(", "),
            }),
          ],
        })
      );
    });
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}
