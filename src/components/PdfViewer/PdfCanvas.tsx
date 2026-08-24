import { useEffect, useRef, useState } from "react";
import type { PDFPageProxy } from "pdfjs-dist";
import { renderPageToCanvas, sampleBackgroundColor } from "../../lib/pdfRender";
import type { TextItem, TextEdit, SignaturePlacement } from "../../types/pdf.types";
import TextLayer from "./TextLayer";

interface PdfCanvasProps {
  page: PDFPageProxy;
  pageIndex: number;
  scale: number;
  textItems: TextItem[];
  getEditForItem: (itemId: string) => TextEdit | undefined;
  onEditChange: (edit: TextEdit) => void;
  onCanvasReady: (pageIndex: number, canvas: HTMLCanvasElement) => void;
  pendingSignatureDataUrl: string | null;
  onPlaceSignature: (placement: Omit<SignaturePlacement, "id">) => void;
}

export default function PdfCanvas({
  page,
  pageIndex,
  scale,
  textItems,
  getEditForItem,
  onEditChange,
  onCanvasReady,
  pendingSignatureDataUrl,
  onPlaceSignature,
}: PdfCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendering, setIsRendering] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsRendering(true);
    renderPageToCanvas(page, canvas, scale)
      .then(() => {
        if (!cancelled) {
          setIsRendering(false);
          onCanvasReady(pageIndex, canvas);
        }
      })
      .catch((err) => console.error("Erreur de rendu page", pageIndex, err));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, scale]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pendingSignatureDataUrl) return;
    const bounds = e.currentTarget.getBoundingClientRect();
    const xPt = (e.clientX - bounds.left) / scale;
    const yPt = (e.clientY - bounds.top) / scale;

    const width = 140;
    const height = 55;

    onPlaceSignature({
      pageIndex,
      x: xPt - width / 2,
      y: yPt - height / 2,
      width,
      height,
      dataUrl: pendingSignatureDataUrl,
    });
  };

  return (
    <div className="relative inline-block shadow-md bg-white">
      <canvas ref={canvasRef} className="block" />
      {isRendering && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <div
        onClick={handleOverlayClick}
        className={`absolute inset-0 ${pendingSignatureDataUrl ? "cursor-crosshair" : ""}`}
      >
        <TextLayer
          textItems={textItems}
          scale={scale}
          pageIndex={pageIndex}
          getEditForItem={getEditForItem}
          onEditChange={onEditChange}
          sampleColor={(xPt, yPt) =>
            canvasRef.current
              ? sampleBackgroundColor(canvasRef.current, xPt, yPt, scale)
              : { r: 1, g: 1, b: 1 }
          }
        />
      </div>
    </div>
  );
}
