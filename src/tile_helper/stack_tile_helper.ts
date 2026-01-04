import type { CommonTile } from "../tile_common";
import { getWindowTile, setWindowTile, wrapKWinTileManager } from "../default_kwin_tile";
import { TileHelper } from "./tile_helper";
import { log, TileUtil } from "../util";
import { LayoutDirection, QtEdge } from "../kwin_enum";

const removeFromTile = (arg: { window: Window } | { tile: CommonTile }) => {
  const isWindowArg = (arg: { window: Window } | { tile: CommonTile }): arg is { window: Window } =>
    "window" in arg;
  let window: Window | undefined;
  let tile: CommonTile | undefined;
  if (isWindowArg(arg)) {
    window = arg.window;
    const windowTile = getWindowTile(window);
    if (!windowTile) {
      log("error, window's tile can't be null");
      return;
    }
    tile = windowTile;
  } else {
    window = undefined;
    tile = arg.tile;
  }
  const parentTile = tile.parent;
  const tiles = parentTile?.tiles;
  if (!parentTile || !tiles) {
    return;
  }
  if (window) {
    setWindowTile(window, null);
  }
  tile.remove();
  const currentWindows = parentTile.tiles.map((tile) => {
    const window = TileUtil.windowForTile(tile);
    if (!window) {
      log("error, tile with null window");
      throw Error("");
    } else {
      return window;
    }
  });
  TileUtil.cleanUpTiles(parentTile);
  currentWindows.forEach((window) => {
    addWindowToScreen({ window });
  });
};

const addWindowToScreen = (arg: { window: Window; screen?: Output }) => {
  const { window, screen } = arg;
  const tileManager = wrapKWinTileManager(workspace.tilingForScreen(window.output));
  const rootTile = tileManager.rootTile;
  addWindowToTile({
    window,
    parentTile: rootTile,
    depth: rootTile.tiles.length,
  });
  rootTile.tiles.forEach((tile) => {
    const window = TileUtil.windowForTile(tile);
    if (window) {
      workspace.raiseWindow(window);
    }
  });
};

const addWindowToTile = (arg: { window: Window; parentTile: CommonTile; depth: number }) => {
  const { window, parentTile, depth } = arg;
  const screen = window?.output;
  if (screen) {
    parentTile.split(LayoutDirection.Floating);
    const tile = parentTile.tiles[depth];
    const rootWidth = parentTile.absoluteGeometry.width;
    const rootHeight = parentTile.absoluteGeometry.height;
    const xTarget = 20 * depth - tile.relativeGeometry.x * rootWidth;
    const yTarget = 20 * depth - tile.relativeGeometry.y * rootHeight;
    tile.resizeByPixels(yTarget, QtEdge.Top);
    tile.resizeByPixels(xTarget, QtEdge.Left);
    const widthTarget =
      parentTile.absoluteGeometry.width - 40 * depth - tile.relativeGeometry.width * rootWidth;
    const heightTarget =
      parentTile.absoluteGeometry.height - 40 * depth - tile.relativeGeometry.height * rootHeight;
    tile.resizeByPixels(widthTarget, QtEdge.Right);
    tile.resizeByPixels(heightTarget, QtEdge.Bottom);
    setWindowTile(window, null);
    setWindowTile(window, tile);
  }
};

const moveWindowToDirection = (arg: {
  window: Window | undefined;
  shouldSwitchWithOther: (tileRect: Rect, otherTileRect: Rect) => boolean;
  shouldChangeLayoutDirection: (
    tileRect: Rect,
    otherTileRect: Rect,
  ) => { should: boolean; indexAfterChangeLayoutDirection: number };
}) => {};

const moveWindowLeft = () => {};

const moveWindowRight = () => {};

const moveWindowDown = () => {};

const moveWindowUp = () => {};

const handleWindowActivated = (window: Window) => {
  const tile = getWindowTile(window);
  if (!tile || !tile.parent) {
    log("error: tile is null");
    return;
  }
  const tiles = tile.parent?.tiles;
  const index = tiles.indexOf(tile);
  if (index === -1) {
    log("error: can't find tile in tiles");
    return;
  }
  if (index === tiles.length - 1) {
    return;
  }
  const windows = tiles.map((tile) => {
    const window = TileUtil.windowForTile(tile);
    if (!window) {
      throw Error("tile with null window");
    } else {
      return window;
    }
  });
  tiles.forEach((tile) => {
    const window = TileUtil.windowForTile(tile);
    if (window) {
      setWindowTile(window, null);
    }
  });
  const popCount = windows.length - 1 - index;
  for (let i = 0; i < popCount; i++) {
    const popped = windows.pop();
    if (popped) {
      windows.splice(0, 0, popped);
    } else {
      throw Error("popped with null window");
    }
  }
  for (let i = 0; i < tiles?.length; i++) {
    setWindowTile(windows[i], tiles[i]);
  }

  tiles.forEach((tile) => {
    const window = TileUtil.windowForTile(tile);
    if (window) {
      workspace.raiseWindow(window);
    }
  });
};

export const StackTileHelper: TileHelper = {
  addWindowToScreen,
  removeFromTile,
  moveWindowLeft,
  moveWindowRight,
  moveWindowUp,
  moveWindowDown,
  handleWindowActivated,
};
