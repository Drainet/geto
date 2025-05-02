import {log, logTileTreeInfo} from "../util";
import {TileHelper, TileMode} from "../tile_helper";

export const windowMinimizedChangedHandler =
    (arg: {
        window: Window
        tileHelperProvider: Record<TileMode, TileHelper>,
        currentTileModeProvider: () => TileMode
    }) => () => {
        const {window, tileHelperProvider, currentTileModeProvider} = arg
        const currentTileMode = currentTileModeProvider()
        log("window minimized changed handler called")
        const tileManager = workspace.tilingForScreen(window.output);
        if (window.minimized) {
            window.minimizedDate = new Date()
            tileHelperProvider[currentTileMode].removeFromTile({window})
        } else {
            window.minimizedDate = undefined
            tileHelperProvider[currentTileMode].addWindowToScreen({window})
        }
        logTileTreeInfo({
            event: `after ${window.resourceName} ${window.minimized ? "minimized" : "un-minimized"}`,
            screen: window.output
        })
    }
