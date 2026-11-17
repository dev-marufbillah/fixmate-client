import { jsPDF } from "jspdf";
import { Payment } from "./types";
import { formatDate } from "./utils";

/** Client-side PDF invoice for a paid job (optional feature #5). */
export function downloadInvoice(payment: Payment) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  // Header band
  doc.setFillColor(15, 118, 110);
  doc.rect(0, 0, 595, 110, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.text("FixMate", 48, 55);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Smart Device & Home Appliance Repair Service", 48, 75);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("PAYMENT INVOICE", 400, 55);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Issued: ${formatDate(payment.paidAt)}`, 400, 72);

  // Status pill
  doc.setFillColor(22, 163, 74);
  doc.roundedRect(400, 82, 80, 18, 6, 6, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("PAID", 428, 95);

  // Body details
  const rows: Array<[string, string]> = [
    ["Service", payment.serviceTitle],
    ["Customer", `${payment.customerName} (${payment.customerEmail})`],
    ["Technician", `${payment.technicianName} (${payment.technicianEmail})`],
    ["Transaction ID", payment.transactionId],
    ["Payment date", formatDate(payment.paidAt)],
    ["Currency", (payment.currency || "usd").toUpperCase()],
    ["Booking ID", String(payment.bookingId)],
  ];

  let y = 150;
  doc.setTextColor(30, 41, 59);
  rows.forEach(([label, value]) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(label, 48, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    const wrapped = doc.splitTextToSize(value || "—", 330) as string[];
    doc.text(wrapped, 220, y);
    y += Math.max(24, wrapped.length * 13);
    doc.setDrawColor(226, 232, 240);
    doc.line(48, y - 10, 547, y - 10);
  });

  // Total box
  doc.setFillColor(240, 253, 250);
  doc.roundedRect(330, y + 10, 217, 54, 10, 10, "F");
  doc.setTextColor(15, 118, 110);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Total paid", 348, y + 34);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(`$${Number(payment.amount).toFixed(2)}`, 547, y + 44, { align: "right" });

  // Footer
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Thank you for using FixMate — pay-after-service, tracked end to end.",
    48,
    800
  );
  doc.text("fixmate.com · support@fixmate.com", 48, 815);

  doc.save(`fixmate-invoice-${payment.transactionId.slice(0, 12) || payment._id}.pdf`);
}
