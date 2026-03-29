import jsPDF from "jspdf";
import { format } from "date-fns";

interface CardData {
  recipientName: string;
  recipientStreet: string;
  recipientCity: string;
  recipientState: string;
  recipientZip: string;
  occasionName: string;
  message: string;
  sendDate: Date | string;
  businessName: string;
}

interface EnvelopeData {
  recipientName: string;
  recipientStreet: string;
  recipientCity: string;
  recipientState: string;
  recipientZip: string;
  returnName: string;
  returnStreet: string;
  returnCity: string;
  returnState: string;
  returnZip: string;
}

/**
 * Generate a printable card PDF (5x7 inches)
 * Front: Occasion title
 * Inside: Message
 */
export function generateCardPDF(cards: CardData[]): jsPDF {
  // 5x7 card = 360x504 points (72 points per inch)
  const cardWidth = 360;
  const cardHeight = 504;
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: [cardWidth, cardHeight],
  });

  cards.forEach((card, index) => {
    if (index > 0) doc.addPage([cardWidth, cardHeight]);

    // === FRONT OF CARD (Page 1 of pair) ===
    // Background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, cardWidth, cardHeight, "F");

    // Decorative border
    doc.setDrawColor(70, 130, 180); // Steel blue
    doc.setLineWidth(3);
    doc.rect(15, 15, cardWidth - 30, cardHeight - 30);
    doc.setLineWidth(1);
    doc.rect(20, 20, cardWidth - 40, cardHeight - 40);

    // Occasion title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(70, 130, 180);
    const titleLines = doc.splitTextToSize(card.occasionName, cardWidth - 80);
    const titleY = cardHeight / 2 - titleLines.length * 18;
    doc.text(titleLines, cardWidth / 2, titleY, { align: "center" });

    // Decorative line
    doc.setDrawColor(70, 130, 180);
    doc.setLineWidth(1);
    doc.line(cardWidth / 2 - 60, titleY + 25, cardWidth / 2 + 60, titleY + 25);

    // Recipient name
    doc.setFont("helvetica", "italic");
    doc.setFontSize(16);
    doc.setTextColor(100, 100, 100);
    doc.text(`For ${card.recipientName}`, cardWidth / 2, titleY + 55, {
      align: "center",
    });

    // === INSIDE OF CARD (Page 2 of pair) ===
    doc.addPage([cardWidth, cardHeight]);

    // Message
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    const messageLines = doc.splitTextToSize(card.message, cardWidth - 80);
    const messageY = cardHeight / 2 - messageLines.length * 10;
    doc.text(messageLines, cardWidth / 2, messageY, { align: "center" });

    // Business name at bottom
    if (card.businessName) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(12);
      doc.setTextColor(120, 120, 120);
      doc.text(`From ${card.businessName}`, cardWidth / 2, cardHeight - 60, {
        align: "center",
      });
    }

    // Send date (small, bottom corner)
    const sendDateStr =
      typeof card.sendDate === "string"
        ? card.sendDate
        : format(card.sendDate, "MMM d, yyyy");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text(sendDateStr, cardWidth - 25, cardHeight - 20, { align: "right" });
  });

  return doc;
}

/**
 * Generate envelope address PDF (#10 envelope: 9.5 x 4.125 inches)
 */
export function generateEnvelopePDF(envelopes: EnvelopeData[]): jsPDF {
  const envWidth = 684; // 9.5 inches in points
  const envHeight = 297; // 4.125 inches in points
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: [envHeight, envWidth],
  });

  envelopes.forEach((env, index) => {
    if (index > 0) doc.addPage([envHeight, envWidth]);

    // Return address (top left)
    if (env.returnName) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      let y = 30;
      doc.text(env.returnName, 30, y);
      y += 12;
      doc.text(env.returnStreet, 30, y);
      y += 12;
      doc.text(
        `${env.returnCity}, ${env.returnState} ${env.returnZip}`,
        30,
        y
      );
    }

    // Recipient address (center-right)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(13);
    doc.setTextColor(0, 0, 0);
    const startX = envWidth * 0.45;
    const startY = envHeight * 0.45;
    doc.text(env.recipientName, startX, startY);
    doc.text(env.recipientStreet, startX, startY + 18);
    doc.text(
      `${env.recipientCity}, ${env.recipientState} ${env.recipientZip}`,
      startX,
      startY + 36
    );
  });

  return doc;
}
