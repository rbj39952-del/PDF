import { Download, PenTool, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";

interface ToolbarProps {
  fileName: string;
  onDownload: () => void;
  isExporting: boolean;
  onOpenSignature: () => void;
  onReset: () => void;
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export default function Toolbar({
  fileName,
  onDownload,
  isExporting,
  onOpenSignature,
  onReset,
  scale,
  onZoomIn,
  onZoomOut,
}: ToolbarProps) {
  return (
    <div className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-slate-700 truncate max-w-[140px] sm:max-w-xs">
          {fileName}
        </span>

        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={onZoomOut}
            className="p-2 rounded-lg hover:bg-slate-100 active:scale-95 transition"
            aria-label="Zoom arrière"
          >
            <ZoomOut className="w-4 h-4 text-slate-600" />
          </button>
          <span className="text-xs text-slate-500 w-10 text-center tabular-nums">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={onZoomIn}
            className="p-2 rounded-lg hover:bg-slate-100 active:scale-95 transition"
            aria-label="Zoom avant"
          >
            <ZoomIn className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        <button
          onClick={onOpenSignature}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 transition"
        >
          <PenTool className="w-4 h-4" />
          <span className="hidden sm:inline">Signer</span>
        </button>

        <button
          onClick={onReset}
          className="p-2 rounded-lg hover:bg-slate-100 active:scale-95 transition"
          aria-label="Recommencer avec un autre fichier"
        >
          <RotateCcw className="w-4 h-4 text-slate-600" />
        </button>

        <button
          onClick={onDownload}
          disabled={isExporting}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition disabled:opacity-60"
        >
          {isExporting ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span>{isExporting ? "Export…" : "Télécharger"}</span>
        </button>
      </div>
    </div>
  );
}
