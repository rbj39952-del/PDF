import { ChevronLeft, ChevronRight } from "lucide-react";

interface PageControlsProps {
  currentPage: number;
  numPages: number;
  onChange: (page: number) => void;
}

export default function PageControls({ currentPage, numPages, onChange }: PageControlsProps) {
  if (numPages <= 1) return null;

  return (
    <div className="flex items-center gap-3 justify-center py-3">
      <button
        onClick={() => onChange(Math.max(1, currentPage - 1))}
        disabled={currentPage <= 1}
        className="p-2 rounded-lg bg-white border border-slate-200 disabled:opacity-40 active:scale-95 transition"
        aria-label="Page précédente"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <span className="text-sm text-slate-600 tabular-nums">
        {currentPage} / {numPages}
      </span>
      <button
        onClick={() => onChange(Math.min(numPages, currentPage + 1))}
        disabled={currentPage >= numPages}
        className="p-2 rounded-lg bg-white border border-slate-200 disabled:opacity-40 active:scale-95 transition"
        aria-label="Page suivante"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
