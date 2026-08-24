import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { TextEdit, SignaturePlacement } from "../types/pdf.types";

export async function exportEditedPdf(
  originalBytes: ArrayBuffer,
  edits: TextEdit[],
  signatures: SignaturePlacement[]
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(originalBytes);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // --- 1. Texte modifié : masquage + réécriture ---
  for (const edit of edits) {
    const page = pdfDoc.getPage(edit.pageIndex);
    const pageHeight = page.getHeight();

    // Conversion de l'origine haut-gauche (utilisée côté UI) vers
    // l'origine bas-gauche attendue par pdf-lib.
    const rectY = pageHeight - edit.y - edit.height;
    const padding = 1.5;

    // 1a. Rectangle de masquage à la couleur de fond échantillonnée
    page.drawRectangle({
      x: edit.x - padding,
      y: rectY - padding,
      width: edit.width + padding * 2,
      height: edit.height + padding * 2,
      color: rgb(edit.backgroundColor.r, edit.backgroundColor.g, edit.backgroundColor.b),
    });

    // 1b. Nouveau texte, ligne de base ≈ bas de la boîte
    if (edit.newText.trim()) {
      const baselineY = pageHeight - edit.y - edit.fontSize * 0.85;
      page.drawText(edit.newText, {
        x: edit.x,
        y: baselineY,
        size: edit.fontSize,
        font: helvetica,
        color: rgb(0, 0, 0),
      });
    }
  }

  // --- 2. Signatures ---
  for (const sig of signatures) {
    const page = pdfDoc.getPage(sig.pageIndex);
    const pageHeight = page.getHeight();
    const pngImage = await pdfDoc.embedPng(sig.dataUrl);

    page.drawImage(pngImage, {
      x: sig.x,
      y: pageHeight - sig.y - sig.height,
      width: sig.width,
      height: sig.height,
    });
  }

  return pdfDoc.save();
}

export function downloadPdfBytes(bytes: Uint8Array, filename: string): void {
  // On repasse par un Uint8Array "frais" adossé à un ArrayBuffer concret :
  // évite un souci de typage strict (Uint8Array<ArrayBufferLike> vs
  // BlobPart) selon la version de TypeScript utilisée au build.
  const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
