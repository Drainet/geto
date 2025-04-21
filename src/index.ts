import {
    isApplicationWindow,
    cleanUpTiles,
    log,
    logTileTreeInfo,
} from "./util";
import {TileHelper} from "./tile_helper";
import {windowMinimizedChangedHandler, windowOutputChangedHandler} from "./signal_handlers";

log("------------------ new geto kwin script session started ------------------")

workspace.windowAdded.connect((window) => {
    if (isApplicationWindow(window)) {
        TileHelper.addWindowToScreen({window})
        window.minimizedChanged.connect(windowMinimizedChangedHandler(window))
        window.outputChanged.connect(windowOutputChangedHandler(window))
    }
})

workspace.windowRemoved.connect((window) => {
    if (isApplicationWindow(window)) {
        TileHelper.removeFromTile({window})
    }
})

workspace.windowList().forEach((window) => {
    window.tile = null
    window.minimizedChanged.connect(windowMinimizedChangedHandler(window))
    window.outputChanged.connect(windowOutputChangedHandler(window))
})

TileHelper.resetAllWindowTiles()