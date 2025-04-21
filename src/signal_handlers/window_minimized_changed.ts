import {log, logTileTreeInfo} from "../util";
import {TileHelper} from "../tile_helper";

export const windowMinimizedChangedHandler = (window: Window) => () => {
    log("window minimized changed handler called")
    const tileManager = workspace.tilingForScreen(window.output);
    if (window.minimized) {
        TileHelper.removeFromTile({window})
        log(`------ info of screen ${window.output.name} after ${window.resourceName} minimized ------`)
        logTileTreeInfo(tileManager.rootTile)
        log(`------ end info of screen ${window.output.name} ------`)
    } else {
        TileHelper.addWindowToScreen({window})
        log(`------ info of screen ${window.output.name} after ${window.resourceName} un-minimized ------`)
        logTileTreeInfo(tileManager.rootTile)
        log(`------ end info of screen ${window.output.name} ------`)
    }
}
