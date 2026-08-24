import { useCallback, useState } from "react";
import type { TextEdit } from "../types/pdf.types";

export function useTextEdits() {
  const [edits, setEdits] = useState<Record<string, TextEdit>>({});

  const setEdit = useCallback((edit: TextEdit) => {
    setEdits((prev) => ({ ...prev, [edit.itemId]: edit }));
  }, []);

  const getEditForItem = useCallback(
    (itemId: string) => edits[itemId],
    [edits]
  );

  const editsList = Object.values(edits);

  return { edits, editsList, setEdit, getEditForItem };
}
