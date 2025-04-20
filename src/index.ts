import {isApplicationWindow, cleanUpTiles, log, logTileInfo, logWindowInfo, logTileTreeInfo} from "./util";
import {LayoutDirection} from "./layout_direction";

log("------------------ new geto kwin script session started ------------------")

const screenWindowMap: Record<string, Window[]> = {}
const screenTileMap: Record<string, Tile[]> = {}

workspace.windowList().forEach((window) => {
    if (!screenWindowMap[window.output.name]) {
        screenWindowMap[window.output.name] = []
    }
    screenWindowMap[window.output.name].push(window)
    window.tile = null
    window.minimizedChanged.connect(() => {
        if (window.minimized) {
            const tile = window.tile
            window.tile = null
            tile?.remove()

            const tileManager = workspace.tilingForScreen(window.output);
            log(`------ info of screen ${window.output.name} after ${window.resourceName} minimized ------`)
            logTileTreeInfo(tileManager.rootTile)
            log(`------ end info of screen ${window.output.name} ------`)
        } else {
            //TODO, handle window un-minimized
        }
    })
})

for (let i = 0; i < workspace.screens.length; i++) {
    const screen = workspace.screens[i]
    const windows = screenWindowMap[screen.name]
    const targetWindows = windows
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
    if (targetWindows.length === 1) {
        targetWindows[0].tile = rootTile
        continue
    }
    const tiles: Tile[] = rootTile.split(LayoutDirection.Vertical)
    for (let i = 2; i < targetWindows.length; i++) {
        const newTiles = tiles.pop()?.split(LayoutDirection.Vertical) ?? []
        newTiles.forEach((tile) => {
            tiles.push(tile)
        })
    }
    for (let i = 0; i < targetWindows.length; i++) {
        targetWindows[i].tile = tiles[i]
    }
    screenTileMap[screen.name] = tiles
    log(`------ info of screen ${screen.name} after tile ------`)
    logTileTreeInfo(tileManager.rootTile)
    log(`------ end info of screen ${screen.name} ------`)
}


