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
            log(`------ info of screen ${window.output.name} after ${window.resourceName} minimized ------`)
            logTileTreeInfo(tileManager.rootTile)
            log(`------ end info of screen ${window.output.name} ------`)
        } else {
            window.minimizedDate = undefined
            tileHelperProvider[currentTileMode].addWindowToScreen({window})
            log(`------ info of screen ${window.output.name} after ${window.resourceName} un-minimized ------`)
            logTileTreeInfo(tileManager.rootTile)
            log(`------ end info of screen ${window.output.name} ------`)
        }
    }
