import type { TextItem, TextEdit } from "../../types/pdf.types";

interface TextLayerProps {
  textItems: TextItem[];
  scale: number;
  pageIndex: number;
  getEditForItem: (itemId: string) => TextEdit | undefined;
  onEditChange: (edit: TextEdit) => void;
  sampleColor: (xPt: number, yPt: number) => { r: number; g: number; b: number };
}

export default function TextLayer({
  textItems,
  scale,
  pageIndex,
  getEditForItem,
  onEditChange,
  sampleColor,
}: TextLayerProps) {
  const handleBlur = (item: TextItem, e: React.FocusEvent<HTMLDivElement>) => {
    const newText = e.currentTarget.textContent ?? "";
    const existing = getEditForItem(item.id);

    // Ne rien faire si le texte n'a pas changé (évite de créer un edit
    // "vide" qui déclencherait un masquage inutile à l'export)
    if (newText === item.text && !existing) return;

    onEditChange({
      itemId: item.id,
      pageIndex,
      newText,
      x: item.x,
      y: item.y,
      width: item.width,
      height: item.height,
      fontSize: item.fontSize,
      backgroundColor: existing?.backgroundColor ?? sampleColor(item.x, item.y),
    });
  };

  return (
    <>
      {textItems.map((item) => {
        const edit = getEditForItem(item.id);
        const displayText = edit ? edit.newText : item.text;

        return (
          <div
            key={item.id}
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleBlur(item, e)}
            className="absolute leading-none whitespace-pre outline-none hover:bg-indigo-100/40 focus:bg-indigo-50 focus:ring-1 focus:ring-indigo-400"
            style={{
              left: item.x * scale,
              top: item.y * scale,
              fontSize: item.fontSize * scale,
              minWidth: item.width * scale,
              color: "transparent",
              caretColor: "black",
            }}
            onFocus={(e) => {
              e.currentTarget.style.color = "black";
              e.currentTarget.style.background = "white";
            }}
            data-original={item.text}
          >
            {displayText}
          </div>
        );
      })}
    </>
  );
}
