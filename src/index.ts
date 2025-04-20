import {
    isApplicationWindow,
    cleanUpTiles,
    log,
    logTileTreeInfo,
    windowForTile
} from "./util";
import {LayoutDirection} from "./layout_direction";

log("------------------ new geto kwin script session started ------------------")

const parentTileForTile = (targetTile: Tile, rootTile: Tile): Tile | undefined => {
    const childTiles = rootTile.tiles
    for (let i = 0; i < childTiles.length; i++) {
        const childTile = childTiles[i]
        if (childTile === targetTile) {
            return rootTile
        }
        const childSearchResult = parentTileForTile(targetTile, childTile)
        if (childSearchResult) {
            return childSearchResult
        }
    }
    return undefined
}

workspace.windowList().forEach((window) => {
    window.tile = null
    window.minimizedChanged.connect(() => {
        const tileManager = workspace.tilingForScreen(window.output);
        if (window.minimized) {
            const tile = window.tile
            if (!tile) {
                log("error, tile can't be null")
                return
            }
            const parentTile = parentTileForTile(tile, tileManager.rootTile)
            log(`parent tile: ${parentTile}`)
            if (parentTile && parentTile.tiles.length === 2) {
                const childTiles = parentTile.tiles
                const indexOfCurrentTile = childTiles.indexOf(tile)
                const indexOfOtherTile = (indexOfCurrentTile + 1) % 2
                const tileForOtherWindow = childTiles[indexOfOtherTile];
                const otherWindow = windowForTile(tileForOtherWindow)
                log(`other window name: ${otherWindow?.resourceName}`)
                if (!otherWindow) {
                    log("error, otherWindow can't be null")
                    return
                }
                window.tile = null
                tile?.remove
                otherWindow.tile = null
                otherWindow.tile = parentTile
            } else {
                window.tile = null
                if (tile?.canBeRemoved) {
                    tile?.remove()
                }
            }

            log(`------ info of screen ${window.output.name} after ${window.resourceName} minimized ------`)
            logTileTreeInfo(tileManager.rootTile)
            log(`------ end info of screen ${window.output.name} ------`)
        } else {
            addWindowToTile(window, tileManager.rootTile)
            log(`------ info of screen ${window.output.name} after ${window.resourceName} un-minimized ------`)
            logTileTreeInfo(tileManager.rootTile)
            log(`------ end info of screen ${window.output.name} ------`)
        }
    })
})


const addWindowToTile = (window: Window, rootTile: Tile) => {
    const windowForRootTile = windowForTile(rootTile);
    if (windowForRootTile) {
        const childTiles = rootTile.split(LayoutDirection.Vertical)
        windowForRootTile.tile = null
        windowForRootTile.tile = childTiles[0]
        window.tile = childTiles[1]
    } else {
        const childTiles = rootTile.tiles
        if (childTiles.length) {
            let maxSizeTile = childTiles[0]
            childTiles.forEach((childTile) => {
                if (childTile.absoluteGeometry.height > maxSizeTile.absoluteGeometry.height) {
                    maxSizeTile = childTile
                }
            })
            const originWindowForMaxSizeTile = windowForTile(maxSizeTile)
            if (!originWindowForMaxSizeTile) {
                log("error, shouldn't be undefined")
                return
            }
            const newChildTiles = maxSizeTile.split(LayoutDirection.Vertical)
            originWindowForMaxSizeTile.tile = null
            originWindowForMaxSizeTile.tile = newChildTiles[0]
            window.tile = newChildTiles[1]
        } else {
            window.tile = rootTile
        }
    }
}

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
        addWindowToTile(window, rootTile)
    })
    log(`------ info of screen ${screen.name} after tile ------`)
    logTileTreeInfo(tileManager.rootTile)
    log(`------ end info of screen ${screen.name} ------`)
}

