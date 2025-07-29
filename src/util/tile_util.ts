import {isApplicationWindow, logTileTreeInfo} from "./index";
import {TileHelper} from "../tile_helper";

const collectAllTiles = (tile: Tile): Tile[] => {
    const results: Tile[] = []
    results.push(tile)
    tile.tiles.forEach((tile) => {
        results.push(...collectAllTiles(tile))
    })
    return results
}

const removeNoWindowTiles = (tileHelper: TileHelper) => {
    workspace.screens.forEach((screen) => {
        const allTiles = collectAllTiles(workspace.tilingForScreen(screen).rootTile)
        allTiles.forEach((tile) => {
            if (!tile.tiles.length && tile.canBeRemoved && !windowForTile(tile)) {
                tileHelper.removeFromTile({tile})
            }
        })
    })
}

const resetAllWindowTiles = (tileHelper: TileHelper) => {
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
        logTileTreeInfo({event: "after clean", screen})
        targetWindows.forEach((window) => {
            tileHelper.addWindowToScreen({window})
        })
        if (workspace.activeWindow) {
            tileHelper.handleWindowActivated(workspace.activeWindow)
        }
        logTileTreeInfo({event: "after reset tile", screen})
    }
}

const tileExistInTiles = (tile: Tile, rootTile: Tile): boolean => {
    if (tile === rootTile) {
        return true
    }
    for (let i = 0; i < rootTile.tiles.length; i++) {
        const childTile = rootTile.tiles[i]
        const existInChild = tileExistInTiles(tile, childTile)
        if (existInChild) {
            return true
        }
    }
    return false
}

const cleanUpTiles = (rootTile: Tile) => {
    let allRemovableTiles = collectAllTiles(rootTile)
        .filter((tile) => tile.canBeRemoved)

    while (allRemovableTiles.length) {
        const tile = allRemovableTiles[0]
        const window = windowForTile(tile)
        if (window) {
            window.tile = null
        }
        tile.remove()
        allRemovableTiles = collectAllTiles(rootTile)
            .filter((tile) => tile.canBeRemoved)
    }
}

const screenForTile = (tile: Tile): Output | undefined => {
    for (let i = 0; i < workspace.screens.length; i++) {
        const screen = workspace.screens[i]
        const tileManager = workspace.tilingForScreen(screen)
        if (tileExistInTiles(tile, tileManager.rootTile)) {
            return screen
        }
    }
    return undefined
}

const windowForTile = (tile: Tile): Window | undefined => {
    const windowList = workspace.windowList()
    for (let i = 0; i < windowList.length; i++) {
        const window = windowList[i]
        if (window.tile === tile) {
            return window
        }
    }
    return undefined
}

export const TileUtil = {
    collectAllTiles,
    resetAllWindowTiles,
    removeNoWindowTiles,
    cleanUpTiles,
    screenForTile,
    windowForTile
}
