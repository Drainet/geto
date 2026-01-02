import { isApplicationWindow, TileUtil } from "./index";

export const log = (message: string) => {
  console.info(message);
};

export const logWindowInfo = (event: string, window: Window) => {
  log(
    JSON.stringify(
      {
        event,
        resourceName: window.resourceName,
        isApplicationWindow: isApplicationWindow(window),
        internalId: window.internalId.toString(),
        pid: window.pid,
        windowRole: window.windowRole,
        resourceClass: window.resourceClass,
        windowType: window.windowType,
        stackingOrder: window.stackingOrder,
        closeable: window.closeable,
        frameGeometry: window.frameGeometry,
        skipTaskbar: window.skipTaskbar,
        minSize: window.minSize,
      },
      null,
      2,
    ),
  );
};

export const logTileInfo = (event: string, tile: Tile) => {
  log(
    JSON.stringify(
      {
        event,
        isLayout: tile.isLayout,
        absoluteGeometry: tile.absoluteGeometry,
        windows: tile.windows.map((window) => window.resourceName),
        canBeRemoved: tile.canBeRemoved,
      },
      null,
      2,
    ),
  );
};

const collectTileTreeInfo = (
  tile: Tile,
  depth: number = 0,
  parentIndex: number,
  currentIndex: number,
  infoArray: string[][],
) => {
  if (depth >= infoArray.length) {
    infoArray.push([]);
  }
  const arrayForCurrentDepth = infoArray[depth];
  const rect = tile.absoluteGeometry;
  const debugInfo = `{x: ${rect.x}, y: ${rect.y}, w: ${rect.width}, h: ${rect.height}}, "${TileUtil.windowForTile(tile)?.resourceName ?? "no window"}", parent index: ${parentIndex}, index: ${currentIndex}, isLayout: ${tile.isLayout}`;
  arrayForCurrentDepth.push(debugInfo);
  for (let i = 0; i < tile.tiles.length; i++) {
    const childTile = tile.tiles[i];
    collectTileTreeInfo(childTile, depth + 1, currentIndex, i, infoArray);
  }
};

export const logTileTreeInfo = (arg: { event: string; screen: Output }) => {
  const { event, screen } = arg;
  const tileManager = workspace.tilingForScreen(screen);
  const rootTile = tileManager.rootTile;
  log(`⎯⎯⎯⎯⎯⎯ info of screen ${screen.name} after ${event} ⎯⎯⎯⎯⎯⎯`);
  const infoArray: string[][] = [];
  collectTileTreeInfo(rootTile, 0, 0, 0, infoArray);
  infoArray.forEach((infoStrings) => {
    const resultString = `${infoStrings.map((s) => `[${s}]`).join(",\n")} `;
    log(resultString);
  });
  log(`⎯⎯⎯⎯⎯⎯ end info of screen ${screen.name} ⎯⎯⎯⎯⎯⎯`);
};
