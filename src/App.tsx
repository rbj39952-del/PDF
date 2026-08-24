import { useEffect, useState } from "react";
import type { PDFPageProxy } from "pdfjs-dist";
import { FileText, Loader2 } from "lucide-react";

import Dropzone from "./components/Dropzone";
import PdfCanvas from "./components/PdfViewer/PdfCanvas";
import PageControls from "./components/PdfViewer/PageControls";
import Toolbar from "./components/Toolbar/Toolbar";
import SignaturePad from "./components/Toolbar/SignaturePad";

import { usePdfDocument } from "./hooks/usePdfDocument";
import { useTextEdits } from "./hooks/useTextEdits";
import { extractTextItems } from "./lib/pdfRender";
import { downloadPdfBytes, exportEditedPdf } from "./lib/pdfExport";
import type { SignaturePlacement, TextItem } from "./types/pdf.types";

const MIN_SCALE = 0.5;
const MAX_SCALE = 2.5;

function App() {
  const [file, setFile] = useState<File | null>(null);
  const { pdfDoc, originalBytes, numPages, isLoading, error } = usePdfDocument(file);
  const { editsList, getEditForItem, setEdit } = useTextEdits();

  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [page, setPage] = useState<PDFPageProxy | null>(null);
  const [textItems, setTextItems] = useState<TextItem[]>([]);
  const [scale, setScale] = useState(1);

  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [pendingSignature, setPendingSignature] = useState<string | null>(null);
  const [signatures, setSignatures] = useState<SignaturePlacement[]>([]);

  const [isExporting, setIsExporting] = useState(false);

  // Charge la page courante + extrait son texte à chaque changement de
  // document ou de numéro de page
  useEffect(() => {
    if (!pdfDoc) return;
    let cancelled = false;

    pdfDoc.getPage(currentPageNum).then(async (loadedPage) => {
      if (cancelled) return;
      setPage(loadedPage);
      const items = await extractTextItems(loadedPage, currentPageNum - 1);
      if (!cancelled) setTextItems(items);
    });

    return () => {
      cancelled = true;
    };
  }, [pdfDoc, currentPageNum]);

  const handleFileAccepted = (accepted: File) => {
    setFile(accepted);
    setCurrentPageNum(1);
    setScale(1);
    setSignatures([]);
  };

  const handleReset = () => {
    setFile(null);
    setPage(null);
    setTextItems([]);
    setSignatures([]);
    setPendingSignature(null);
  };

  const handlePlaceSignature = (placement: Omit<SignaturePlacement, "id">) => {
    setSignatures((prev) => [...prev, { ...placement, id: `sig-${Date.now()}` }]);
    setPendingSignature(null);
  };

  const handleDownload = async () => {
    if (!originalBytes) return;
    setIsExporting(true);
    try {
      const bytes = await exportEditedPdf(originalBytes, editsList, signatures);
      downloadPdfBytes(bytes, file ? `modifie-${file.name}` : "document-modifie.pdf");
    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue lors de l'export du PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {!file && (
        <header className="border-b border-slate-200 bg-white">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            <h1 className="text-lg font-semibold text-slate-900">
              Éditeur PDF Intelligent
            </h1>
          </div>
        </header>
      )}

      {file && (
        <Toolbar
          fileName={file.name}
          onDownload={handleDownload}
          isExporting={isExporting}
          onOpenSignature={() => setShowSignaturePad(true)}
          onReset={handleReset}
          scale={scale}
          onZoomIn={() => setScale((s) => Math.min(MAX_SCALE, s + 0.15))}
          onZoomOut={() => setScale((s) => Math.max(MIN_SCALE, s - 0.15))}
        />
      )}

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 overflow-auto">
        {!file && <Dropzone onFileAccepted={handleFileAccepted} />}

        {file && isLoading && (
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin" />
            <p className="text-sm">Analyse du document…</p>
          </div>
        )}

        {file && error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 max-w-md text-center">
            {error}
          </p>
        )}

        {file && !isLoading && page && (
          <>
            <PageControls
              currentPage={currentPageNum}
              numPages={numPages}
              onChange={setCurrentPageNum}
            />
            <div className="overflow-auto max-w-full">
              <PdfCanvas
                page={page}
                pageIndex={currentPageNum - 1}
                scale={scale}
                textItems={textItems}
                getEditForItem={getEditForItem}
                onEditChange={setEdit}
                onCanvasReady={() => {}}
                pendingSignatureDataUrl={pendingSignature}
                onPlaceSignature={handlePlaceSignature}
              />
            </div>
            {pendingSignature && (
              <p className="text-xs text-indigo-600 mt-3 text-center">
                Touchez le document à l'endroit où placer votre signature
              </p>
            )}
          </>
        )}
      </main>

      {showSignaturePad && (
        <SignaturePad
          onClose={() => setShowSignaturePad(false)}
          onSave={(dataUrl) => {
            setPendingSignature(dataUrl);
            setShowSignaturePad(false);
          }}
        />
      )}
    </div>
  );
}

export default App;
