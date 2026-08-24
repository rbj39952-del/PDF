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

export async function extractTextItems(
  page: PDFPageProxy,
  pageIndex: number
): Promise<TextItem[]> {
  const viewport = page.getViewport({ scale: 1 });
  const textContent = await page.getTextContent();

  const items: TextItem[] = [];

  textContent.items.forEach((raw, index) => {
    // Les items marked-content (sans propriété transform) sont ignorés
    const item = raw as { str?: string; transform?: number[]; width?: number };
    if (!item.transform || !item.str || !item.str.trim()) return;

    const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
    const fontSize = Math.hypot(tx[2], tx[3]);
    const x = tx[4];
    const y = tx[5] - fontSize;

    items.push({
      id: `p${pageIndex}-i${index}`,
      pageIndex,
      text: item.str,
      x,
      y,
      width: item.width ?? fontSize * item.str.length * 0.5,
      height: fontSize * 1.2,
      fontSize,
    });
  });

  return items;
}

export function getPageSizePt(page: PDFPageProxy): { width: number; height: number } {
  const viewport = page.getViewport({ scale: 1 });
  return { width: viewport.width, height: viewport.height };
}

export function sampleBackgroundColor(
  canvas: HTMLCanvasElement,
  xPt: number,
  yPt: number,
  scale: number
): { r: number; g: number; b: number } {
  const context = canvas.getContext("2d");
  if (!context) return { r: 1, g: 1, b: 1 };

  const px = Math.max(0, Math.min(canvas.width - 1, Math.round((xPt - 2) * scale)));
  const py = Math.max(0, Math.min(canvas.height - 1, Math.round((yPt - 2) * scale)));

  try {
    const data = context.getImageData(px, py, 1, 1).data;
    return { r: data[0] / 255, g: data[1] / 255, b: data[2] / 255 };
  } catch {
    return { r: 1, g: 1, b: 1 };
  }
}
