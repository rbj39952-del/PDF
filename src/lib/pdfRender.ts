import * as pdfjsLib from "pdfjs-dist";
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import type { TextItem } from "../types/pdf.types";

// Worker chargé depuis un CDN (aucun fichier binaire à gérer manuellement,
// idéal pour un déploiement sans terminal local). La version doit
// correspondre exactement à celle de pdfjs-dist dans package.json.
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://unpkg.com/pdfjs-dist@4.6.82/build/pdf.worker.min.mjs";

export async function loadPdfDocument(
  data: ArrayBuffer
): Promise<PDFDocumentProxy> {
  // pdf.js "détache" (neutre) le buffer qu'on lui passe. On lui donne donc
  // une copie pour pouvoir garder l'original intact pour l'export pdf-lib.
  const copy = data.slice(0);
  const loadingTask = pdfjsLib.getDocument({ data: copy });
  return loadingTask.promise;
}

export async function renderPageToCanvas(
  page: PDFPageProxy,
  canvas: HTMLCanvasElement,
  scale: number
): Promise<void> {
  const viewport = page.getViewport({ scale });
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Impossible d'obtenir le contexte canvas");

  canvas.width = viewport.width;
  canvas.height = viewport.height;
  canvas.style.width = `${viewport.width}px`;
  canvas.style.height = `${viewport.height}px`;

  await page.render({
    canvasContext: context,
    viewport,
  }).promise;
}

/**
 * Extrait les fragments de texte d'une page, positionnés en points PDF
 * (équivalent à un rendu à scale = 1), origine en haut-gauche.
 *
 * Limitation MVP : suppose que la page n'a pas de rotation particulière.
 */
export async function extractTextItems(
  page: PDFPageProxy,
  pageIndex: number
): Promise<TextItem[]> {
  const viewport = page.getViewport({ scale: 1 });
  const textContent = await page.getTextContent();

  const items: TextItem[] = [];

  textContent.items.forEach((raw, index) => {
    // Les items "marked content" (sans transform) sont ignorés
    if (!("transform" in raw) || !raw.str
