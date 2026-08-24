// Un fragment de texte extrait du PDF, positionné en "points PDF"
// (espace de coordonnées natif du PDF, origine en haut-gauche pour x/y ici
// afin de simplifier le positionnement CSS — la conversion vers l'origine
// bas-gauche de pdf-lib se fait uniquement au moment de l'export).
export interface TextItem {
  id: string;
  pageIndex: number; // 0-based
  text: string;
  x: number; // en points PDF, origine haut-gauche
  y: number; // en points PDF, origine haut-gauche
  width: number;
  height: number;
  fontSize: number;
}

// Une modification apportée par l'utilisateur à un TextItem
export interface TextEdit {
  itemId: string;
  pageIndex: number;
  newText: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  // Couleur de fond échantillonnée sur le canvas, utilisée pour masquer
  // l'ancien texte. Format 0-1 (attendu par pdf-lib).
  backgroundColor: { r: number; g: number; b: number };
}

// Une signature dessinée et placée sur une page
export interface SignaturePlacement {
  id: string;
  pageIndex: number;
  x: number; // en points PDF, origine haut-gauche
  y: number;
  width: number;
  height: number;
  dataUrl: string; // PNG base64
}

export interface PageRenderInfo {
  pageIndex: number;
  widthPt: number; // largeur de la page en points PDF (scale = 1)
  heightPt: number;
}
