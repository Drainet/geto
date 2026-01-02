import { log, logTileTreeInfo } from "../util";
import { TileHelper, TileMode } from "../tile_helper";

export const windowMinimizedChangedHandler =
  (arg: {
    window: Window;
    tileHelperProvider: Record<TileMode, TileHelper>;
    currentTileModeProvider: () => TileMode;
  }) =>
  () => {
    const { window, tileHelperProvider, currentTileModeProvider } = arg;
    const currentTileMode = currentTileModeProvider();
    log("window minimized changed handler called");
    const tileHelper = tileHelperProvider[currentTileMode];
    if (window.minimized) {
      window.minimizedDate = new Date();
      tileHelper.removeFromTile({ window });
    } else {
      window.minimizedDate = undefined;
      tileHelper.addWindowToScreen({ window });
    }
    logTileTreeInfo({
      event: `after ${window.resourceName} ${window.minimized ? "minimized" : "un-minimized"}`,
      screen: window.output,
    });
  };
