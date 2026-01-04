import type { CommonTile } from "../tile_common";
import { getWindowTile, setWindowTile, wrapKWinTileManager } from "../default_kwin_tile";
import { isApplicationWindow, logTileTreeInfo } from "./index";
import { TileHelper } from "../tile_helper";

const collectAllTiles = (tile: CommonTile): CommonTile[] => {
  const results: CommonTile[] = [];
  results.push(tile);
  tile.tiles.forEach((tile) => {
    results.push(...collectAllTiles(tile));
  });
  return results;
};

const removeNoWindowTiles = (tileHelper: TileHelper) => {
  workspace.screens.forEach((screen) => {
    const getTargetTiles = () => {
      const rootTile = wrapKWinTileManager(workspace.tilingForScreen(screen)).rootTile;
      return collectAllTiles(rootTile).filter(
        (tile) => tile.canBeRemoved && !tile.tiles.length && !windowForTile(tile),
      );
    };
    let targetTiles = getTargetTiles();
    while (targetTiles.length) {
      tileHelper.removeFromTile({ tile: targetTiles[0] });
      targetTiles = getTargetTiles();
    }
  });
};

const resetAllWindowTiles = (tileHelper: TileHelper) => {
  for (let i = 0; i < workspace.screens.length; i++) {
    const screen = workspace.screens[i];
    const targetWindows = workspace
      .windowList()
      .filter((window) => window.output.name === screen.name)
      .filter(isApplicationWindow)
      .filter((window) => !window.minimized);
    if (!targetWindows.length) {
      continue;
    }

    const tileManager = wrapKWinTileManager(workspace.tilingForScreen(screen));
    const rootTile = tileManager.rootTile;
    cleanUpTiles(rootTile);
    logTileTreeInfo({ event: "after clean", screen });
    targetWindows.forEach((window) => {
      tileHelper.addWindowToScreen({ window });
    });
    if (workspace.activeWindow) {
      tileHelper.handleWindowActivated(workspace.activeWindow);
    }
    logTileTreeInfo({ event: "after reset tile", screen });
  }
};

const tileExistInTiles = (tile: CommonTile, rootTile: CommonTile): boolean => {
  if (tile === rootTile) {
    return true;
  }
  for (let i = 0; i < rootTile.tiles.length; i++) {
    const childTile = rootTile.tiles[i];
    const existInChild = tileExistInTiles(tile, childTile);
    if (existInChild) {
      return true;
    }
  }
  return false;
};

const cleanUpTiles = (rootTile: CommonTile) => {
  let allRemovableTiles = collectAllTiles(rootTile).filter((tile) => tile.canBeRemoved);

  while (allRemovableTiles.length) {
    const tile = allRemovableTiles[0];
    const window = windowForTile(tile);
    if (window) {
      setWindowTile(window, null);
    }
    tile.remove();
    allRemovableTiles = collectAllTiles(rootTile).filter((tile) => tile.canBeRemoved);
  }
  if (!rootTile.canBeRemoved) {
    const window = windowForTile(rootTile);
    if (window) {
      setWindowTile(window, null);
    }
  }
};

const screenForTile = (tile: CommonTile): Output | undefined => {
  for (let i = 0; i < workspace.screens.length; i++) {
    const screen = workspace.screens[i];
    const tileManager = wrapKWinTileManager(workspace.tilingForScreen(screen));
    if (tileExistInTiles(tile, tileManager.rootTile)) {
      return screen;
    }
  }
  return undefined;
};

const windowForTile = (tile: CommonTile): Window | undefined => {
  const windowList = workspace.windowList();
  for (let i = 0; i < windowList.length; i++) {
    const window = windowList[i];
    const windowTile = getWindowTile(window);
    if (windowTile === tile) {
      return window;
    }
  }
  return undefined;
};

export const TileUtil = {
  collectAllTiles,
  resetAllWindowTiles,
  removeNoWindowTiles,
  cleanUpTiles,
  screenForTile,
  windowForTile,
};
