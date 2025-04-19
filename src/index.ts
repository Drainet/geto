import {isApplicationWindow, log, logTileInfo, logWindowInfo} from "./util";
import {LayoutDirection} from "./layout_direction";

log("------------------ new geto kwin script session started ------------------")

const screenWindowMap: Record<string, Window[]> = {}
const screenTileMap: Record<string, Tile[]> = {}

const collectRemovableTiles =  (rootTile: Tile): Tile[]  => {
    const results: Tile[] = []
    rootTile.tiles.forEach((tile) => {
        if (tile.canBeRemoved) {
            results.push(tile)
        }
        results.push(...collectRemovableTiles(tile))
    })
    return results
}

workspace.windowList().forEach((window) => {
    if (!screenWindowMap[window.output.name]) {
        screenWindowMap[window.output.name] = []
    }
    screenWindowMap[window.output.name].push(window)
    window.tile = null
    window.minimizedChanged.connect(() => {
        if (window.minimized) {
            logWindowInfo("window be minimized", window)
            const tile = window.tile
            window.tile = null
            tile?.remove()
        } else {
            //TODO, handle window un-minimized
        }
    })
})

workspace.screens.forEach((screen) => {
    const windows = screenWindowMap[screen.name]
    const targetWindows = windows
        .filter(isApplicationWindow)
        .filter((window) => !window.minimized)
    if (!targetWindows.length) {
        return
    }

    const tileManager = workspace.tilingForScreen(workspace.screens[0]);
    const rootTile = tileManager.rootTile
    const allRemovableTiles = collectRemovableTiles(rootTile)
    allRemovableTiles.forEach((tile) => {
        tile.remove()
    })
    if (targetWindows.length === 1) {
        targetWindows[0].tile = rootTile
        return
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
})

