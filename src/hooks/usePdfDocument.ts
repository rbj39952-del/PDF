import { useEffect, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { loadPdfDocument } from "../lib/pdfRender";

interface UsePdfDocumentResult {
  pdfDoc: PDFDocumentProxy | null;
  originalBytes: ArrayBuffer | null;
  numPages: number;
  isLoading: boolean;
  error: string | null;
}

export function usePdfDocument(file: File | null): UsePdfDocumentResult {
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [originalBytes, setOriginalBytes] = useState<ArrayBuffer | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPdfDoc(null);
      setOriginalBytes(null);
      setNumPages(0);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    file
      .arrayBuffer()
      .then(async (bytes) => {
        if (cancelled) return;
        setOriginalBytes(bytes);
        const doc = await loadPdfDocument(bytes);
        if (cancelled) return;
        setPdfDoc(doc);
        setNumPages(doc.numPages);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        setError("Impossible de lire ce PDF. Le fichier est peut-être corrompu ou protégé.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [file]);

  return { pdfDoc, originalBytes, numPages, isLoading, error };
}
