import type { CommonTile } from "../tile_common";
import { getWindowTile, setWindowTile, wrapKWinTileManager } from "../default_kwin_tile";
import { TileHelper } from "./tile_helper";
import { TileUtil } from "../util";
import { LayoutDirection, QtEdge } from "../kwin_enum";

const removeFromTile = (arg: { window: Window } | { tile: CommonTile }) => {
  TileUtil.resetAllWindowTiles(QueueTileHelper);
};

const addWindowToScreen = (arg: { window: Window; screen?: Output }) => {
  const { window } = arg;
  const tileManager = wrapKWinTileManager(workspace.tilingForScreen(window.output));
  const rootTile = tileManager.rootTile;
  const screen = window?.output;
  if (screen) {
    rootTile.split(LayoutDirection.Floating);
    const tileCount = rootTile.tiles.length;
    const tile = rootTile.tiles[tileCount - 1];
    const rootWidth = rootTile.absoluteGeometry.width;
    const rootHeight = rootTile.absoluteGeometry.height;
    const xResizeDiff = 40 * (tileCount - 1) - tile.relativeGeometry.x * rootWidth;
    const yResizeDiff = 0 - tile.relativeGeometry.y * rootHeight;
    tile.resizeByPixels(yResizeDiff, QtEdge.Top);
    tile.resizeByPixels(xResizeDiff, QtEdge.Left);
    const targetWidth = rootTile.absoluteGeometry.width - 40 * (tileCount - 1);
    const widthResizeDiff = targetWidth - tile.relativeGeometry.width * rootWidth;
    const heightResizeDiff =
      rootTile.absoluteGeometry.height - tile.relativeGeometry.height * rootHeight;
    tile.resizeByPixels(widthResizeDiff, QtEdge.Right);
    tile.resizeByPixels(heightResizeDiff, QtEdge.Bottom);

    let insertIndex = tileCount - 1;
    let previousActiveWindow: Window | undefined;
    if (workspace.activeWindow === window) {
      if (tileCount > 1) {
        previousActiveWindow = rootTile.tiles
          .map((tile) => TileUtil.windowForTile(tile))
          .filter((window): window is Window => !!window && window.output === screen)
          .reduce<Window | undefined>((latestWindow, currentWindow) => {
            if (
              !latestWindow ||
              (currentWindow.lastActivatedDate &&
                (!latestWindow.lastActivatedDate ||
                  currentWindow.lastActivatedDate > latestWindow.lastActivatedDate))
            ) {
              return currentWindow;
            }
            return latestWindow;
          }, undefined);
      } else {
        previousActiveWindow = undefined;
      }
    } else {
      previousActiveWindow = workspace.activeWindow;
    }
    const previousActiveTile = previousActiveWindow ? getWindowTile(previousActiveWindow) : null;
    if (previousActiveWindow && previousActiveWindow.output === screen && previousActiveTile) {
      const activeWindowIndex = rootTile.tiles.indexOf(previousActiveTile);
      if (activeWindowIndex !== -1) {
        insertIndex = activeWindowIndex + 1;
      }
    }

    if (insertIndex < tileCount - 1) {
      const windowsToBeShifted: Window[] = [];
      for (let i = insertIndex; i < tileCount - 1; i++) {
        const currentTile = rootTile.tiles[i];
        const tileWindow = TileUtil.windowForTile(currentTile);
        if (tileWindow) {
          windowsToBeShifted.push(tileWindow);
        }
      }

      for (let i = 0; i < windowsToBeShifted.length; i++) {
        const tileWindow = windowsToBeShifted[i];
        const nextTile = rootTile.tiles[insertIndex + i + 1];
        setWindowTile(tileWindow, null);
        setWindowTile(tileWindow, nextTile);
      }

      setWindowTile(window, null);
      setWindowTile(window, rootTile.tiles[insertIndex]);
    } else {
      setWindowTile(window, null);
      setWindowTile(window, rootTile.tiles[tileCount - 1]);
    }
    rootTile.tiles.forEach((tile) => {
      const widthResizeDiff = targetWidth - tile.relativeGeometry.width * rootWidth;
      tile.resizeByPixels(widthResizeDiff, QtEdge.Right);
      const window = TileUtil.windowForTile(tile);
      if (window) {
        setWindowTile(window, null);
        setWindowTile(window, tile);
      }
    });
  }
  if (window === workspace.activeWindow) {
    handleWindowActivated(window);
  }
};

const moveWindowLeft = () => {
  const window = workspace.activeWindow;
  const activeTile = window ? getWindowTile(window) : null;
  if (window && window?.output && activeTile) {
    const tile = activeTile;
    const tileManager = wrapKWinTileManager(workspace.tilingForScreen(window.output));
    const rootTile = tileManager.rootTile;
    const tiles = rootTile.tiles;
    const index = tiles.indexOf(tile);
    if (index !== 0) {
      const leftTile = tiles[index - 1];
      const leftWindow = TileUtil.windowForTile(leftTile);
      if (leftWindow) {
        setWindowTile(leftWindow, null);
        setWindowTile(window, null);
        setWindowTile(leftWindow, tile);
        setWindowTile(window, leftTile);
        handleWindowActivated(window);
      }
    }
  }
};

const moveWindowRight = () => {
  const window = workspace.activeWindow;
  const activeTile = window ? getWindowTile(window) : null;
  if (window && window?.output && activeTile) {
    const tile = activeTile;
    const tileManager = wrapKWinTileManager(workspace.tilingForScreen(window.output));
    const rootTile = tileManager.rootTile;
    const tiles = rootTile.tiles;
    const index = tiles.indexOf(tile);
    if (index !== tiles.length - 1) {
      const rightTile = tiles[index + 1];
      const rightWindow = TileUtil.windowForTile(rightTile);
      if (rightWindow) {
        setWindowTile(rightWindow, null);
        setWindowTile(window, null);
        setWindowTile(rightWindow, tile);
        setWindowTile(window, rightTile);
        handleWindowActivated(window);
      }
    }
  }
};

const moveWindowDown = () => {};

const moveWindowUp = () => {};

const handleWindowActivated = (window: Window) => {
  const tileManager = wrapKWinTileManager(workspace.tilingForScreen(window.output));
  const rootTile = tileManager.rootTile;
  const allWindows = rootTile.tiles.map((tile) => {
    const window = TileUtil.windowForTile(tile);
    if (!window) {
      throw Error("tile with null window");
    } else {
      return window;
    }
  });
  const index = allWindows.indexOf(window);
  for (let i = allWindows.length - 1; i > index; i--) {
    const window = allWindows[i];
    workspace.raiseWindow(window);
  }
  for (let i = 0; i < index; i++) {
    const window = allWindows[i];
    workspace.raiseWindow(window);
  }
  workspace.raiseWindow(window);
};

export const QueueTileHelper: TileHelper = {
  addWindowToScreen,
  removeFromTile,
  moveWindowLeft,
  moveWindowRight,
  moveWindowUp,
  moveWindowDown,
  handleWindowActivated,
};
