import { useCallback, useState } from "react";
import { UploadCloud, FileText } from "lucide-react";

interface DropzoneProps {
  onFileAccepted: (file: File) => void;
}

export default function Dropzone({ onFileAccepted }: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.type === "application/pdf") {
        onFileAccepted(file);
      }
    },
    [onFileAccepted]
  );

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      onFileAccepted(file);
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`
        w-full max-w-xl mx-auto rounded-2xl border-2 border-dashed
        p-12 text-center transition-all duration-200 cursor-pointer
        ${isDragging
          ? "border-indigo-500 bg-indigo-50 scale-[1.02]"
          : "border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50"}
      `}
    >
      <label htmlFor="pdf-upload" className="cursor-pointer block">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-indigo-100">
            {isDragging ? (
              <FileText className="w-8 h-8 text-indigo-600" />
            ) : (
              <UploadCloud className="w-8 h-8 text-indigo-600" />
            )}
          </div>
          <div>
            <p className="text-base font-medium text-slate-800">
              Glissez votre PDF ici
            </p>
            <p className="text-sm text-slate-500 mt-1">
              ou cliquez pour parcourir vos fichiers
            </p>
          </div>
          <span className="text-xs text-slate-400">
            100 % local — aucun fichier envoyé à un serveur
          </span>
        </div>
      </label>
      <input
        id="pdf-upload"
        type="file"
        accept="application/pdf"
        onChange={handleSelect}
        className="hidden"
      />
    </div>
  );
}
