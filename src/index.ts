import {
    isApplicationWindow,
    cleanUpTiles,
    log,
    logTileTreeInfo,
} from "./util";
import {TileHelper} from "./tile_management";
import {windowMinimizedChangedHandler, windowOutputChangedHandler} from "./signal_handlers";

log("------------------ new geto kwin script session started ------------------")

workspace.windowAdded.connect((window) => {
    if (isApplicationWindow(window)) {
        TileHelper.addWindowToTile({window})
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

for (let i = 0; i < workspace.screens.length; i++) {
    const screen = workspace.screens[i]
    const targetWindows = workspace.windowList()
        .filter((window) => window.output.name === screen.name)
        .filter(isApplicationWindow)
        .filter((window) => !window.minimized)
    if (!targetWindows.length) {
        continue
    }

    const tileManager = workspace.tilingForScreen(screen);
    const rootTile = tileManager.rootTile
    cleanUpTiles(rootTile)
    log(`------ info of screen ${screen.name} after clean ------`)
    logTileTreeInfo(tileManager.rootTile)
    log(`------ end info of screen ${screen.name} ------`)
    targetWindows.forEach((window) => {
        TileHelper.addWindowToTile({window})
    })
    log(`------ info of screen ${screen.name} after tile ------`)
    logTileTreeInfo(tileManager.rootTile)
    log(`------ end info of screen ${screen.name} ------`)
}

