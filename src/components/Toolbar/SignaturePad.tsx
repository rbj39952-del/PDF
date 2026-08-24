import { useRef, useState } from "react";
import { X, Trash2, Check } from "lucide-react";

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
  onClose: () => void;
}

export default function SignaturePad({ onSave, onClose }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasStroke, setHasStroke] = useState(false);

  const getContext = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#1e293b";
    }
    return ctx;
  };

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    const ctx = getContext();
    const { x, y } = getPos(e);
    ctx?.beginPath();
    ctx?.moveTo(x, y);
    setHasStroke(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = getContext();
    const { x, y } = getPos(e);
    ctx?.lineTo(x, y);
    ctx?.stroke();
  };

  const handlePointerUp = () => {
    drawing.current = false;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasStroke(false);
  };

  const confirm = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSave(canvas.toDataURL("image/png"));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-slate-900">Votre signature</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <canvas
          ref={canvasRef}
          width={500}
          height={200}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="w-full h-48 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 touch-none"
        />

        <div className="flex gap-2 mt-4">
          <button
            onClick={clear}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 active:scale-95 transition"
          >
            <Trash2 className="w-4 h-4" />
            Effacer
          </button>
          <button
            onClick={confirm}
            disabled={!hasStroke}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            Valider
          </button>
        </div>
        <p className="text-xs text-slate-400 text-center mt-3">
          Ensuite, touchez l'endroit du document où la placer
        </p>
      </div>
    </div>
  );
}
