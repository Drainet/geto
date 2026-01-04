import type { CommonTile, CommonTileManager } from "./tile_common";

const kwinTileCache = new WeakMap<Tile, DefaultKWinTile>();

const wrapKWinTile = (tile: Tile): DefaultKWinTile => {
  const cachedTile = kwinTileCache.get(tile);
  if (cachedTile) {
    return cachedTile;
  }
  const wrapper = new DefaultKWinTile(tile);
  kwinTileCache.set(tile, wrapper);
  return wrapper;
};

const unwrapKWinTile = (tile: CommonTile | null): Tile | null => {
  if (!tile) {
    return null;
  }
  if (tile instanceof DefaultKWinTile) {
    return tile.getKWinTile();
  }
  return null;
};

export class DefaultKWinTile implements CommonTile {
  private kwinTile: Tile;

  constructor(tile: Tile) {
    this.kwinTile = tile;
  }

  getKWinTile(): Tile {
    return this.kwinTile;
  }

  get absoluteGeometry(): Rect {
    return this.kwinTile.absoluteGeometry;
  }

  get relativeGeometry(): Rect {
    return this.kwinTile.relativeGeometry;
  }

  resizeByPixels(size: number, edge: number) {
    this.kwinTile.resizeByPixels(size, edge);
  }

  get windows(): Window[] {
    return this.kwinTile.windows;
  }

  get tiles(): CommonTile[] {
    return this.kwinTile.tiles.map(wrapKWinTile);
  }

  split(direction: number): CommonTile[] {
    return this.kwinTile.split(direction).map(wrapKWinTile);
  }

  get isLayout(): boolean {
    return this.kwinTile.isLayout;
  }

  get canBeRemoved(): boolean {
    return this.kwinTile.canBeRemoved;
  }

  remove() {
    this.kwinTile.remove();
  }

  get parent(): CommonTile | null {
    return this.kwinTile.parent ? wrapKWinTile(this.kwinTile.parent) : null;
  }
}

export class DefaultKWinTileManager implements CommonTileManager {
  private kwinTileManager: TileManager;

  constructor(tileManager: TileManager) {
    this.kwinTileManager = tileManager;
  }

  get rootTile(): CommonTile {
    return wrapKWinTile(this.kwinTileManager.rootTile);
  }
}

export const wrapKWinTileManager = (tileManager: TileManager): DefaultKWinTileManager => {
  return new DefaultKWinTileManager(tileManager);
};

export const getWindowTile = (window: Window): CommonTile | null => {
  return window.tile ? wrapKWinTile(window.tile) : null;
};

export const setWindowTile = (window: Window, tile: CommonTile | null) => {
  window.tile = unwrapKWinTile(tile);
};
