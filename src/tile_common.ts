export interface CommonTile {
  absoluteGeometry: Rect;
  relativeGeometry: Rect;
  resizeByPixels: (size: number, edge: number) => void;
  windows: Window[];
  tiles: CommonTile[];
  split: (direction: number) => CommonTile[];
  isLayout: boolean;
  canBeRemoved: boolean;
  remove: () => void;
  parent: CommonTile | null;
}

export interface CommonTileManager {
  rootTile: CommonTile;
}
