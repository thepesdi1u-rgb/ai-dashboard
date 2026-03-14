import { jsPDF } from "jspdf";

export const downloadPDF = (title: string, content: string, filename: string) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxLineWidth = pageWidth - margin * 2;

  // Title
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  const splitTitle = doc.splitTextToSize(title, maxLineWidth);
  doc.text(splitTitle, margin, 20);
  
  let currentY = 20 + (splitTitle.length * 10);

  // Content
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  
  // Replace markdown-like characters for cleaner PDF text
  const cleanContent = content
    .replace(/#{1,6}\s/g, "") // Remove headers
    .replace(/\*\*/g, "")      // Remove bold
    .replace(/\*/g, "")       // Remove italics
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1"); // Simplify links

  const splitContent = doc.splitTextToSize(cleanContent, maxLineWidth);
  
  // Add pages as needed
  for (let i = 0; i < splitContent.length; i++) {
    if (currentY > 280) {
      doc.addPage();
      currentY = 20;
    }
    doc.text(splitContent[i], margin, currentY);
    currentY += 7;
  }

  doc.save(`${filename}.pdf`);
};
