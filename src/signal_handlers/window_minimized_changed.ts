import {log, logTileTreeInfo} from "../util";
import {TileHelper} from "../tile_management";

export const windowMinimizedChangedHandler = (window: Window) => () => {
    const tileManager = workspace.tilingForScreen(window.output);
    if (window.minimized) {
        TileHelper.removeFromTile({window})
        log(`------ info of screen ${window.output.name} after ${window.resourceName} minimized ------`)
        logTileTreeInfo(tileManager.rootTile)
        log(`------ end info of screen ${window.output.name} ------`)
    } else {
        TileHelper.addWindowToTile({window})
        log(`------ info of screen ${window.output.name} after ${window.resourceName} un-minimized ------`)
        logTileTreeInfo(tileManager.rootTile)
        log(`------ end info of screen ${window.output.name} ------`)
    }
}
