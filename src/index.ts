import {
    isApplicationWindow,
    cleanUpTiles,
    log,
    logTileTreeInfo,
    windowForTile, screenForTile, collectAllTiles
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

workspace.windowAdded.connect((window) => {
    if (isApplicationWindow(window)) {
        addWindowToTile({window})
    }
})

workspace.windowRemoved.connect((window) => {
    if (isApplicationWindow(window)) {
        removeFromTile({window})
    }
})

workspace.windowList().forEach((window) => {
    window.tile = null
    window.minimizedChanged.connect(() => {
        const tileManager = workspace.tilingForScreen(window.output);
        if (window.minimized) {
            removeFromTile({window})
            log(`------ info of screen ${window.output.name} after ${window.resourceName} minimized ------`)
            logTileTreeInfo(tileManager.rootTile)
            log(`------ end info of screen ${window.output.name} ------`)
        } else {
            addWindowToTile({window})
            log(`------ info of screen ${window.output.name} after ${window.resourceName} un-minimized ------`)
            logTileTreeInfo(tileManager.rootTile)
            log(`------ end info of screen ${window.output.name} ------`)
        }
    })
    window.outputChanged.connect(() => {
        workspace.screens.forEach((screen) => {
            const allTiles = collectAllTiles(workspace.tilingForScreen(screen).rootTile)
            allTiles.forEach((tile) => {
                if (!tile.tiles.length && tile.canBeRemoved && !windowForTile(tile)) {
                    removeFromTile({tile, screen})
                }
            })
        })
        addWindowToTile({window})
    })
})

const removeFromTile = (
    arg: { window: Window, screen?: Output } | { tile: Tile, screen: Output }
) => {
    const isWindowArg = (arg: any): arg is { window: Window, screen?: Output } => {
        return 'window' in arg;
    }
    let window: Window | undefined
    let tile: Tile
    let screen: Output | undefined
    if (isWindowArg(arg)) {
        window = arg.window
        if (!window.tile) {
            log("error, window's tile can't be null")
            return
        }
        tile = window.tile
        screen = arg.screen ?? window.output
    } else {
        window = undefined
        tile = arg.tile
        screen = arg.screen
    }
    const tileManager = workspace.tilingForScreen(screen)


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
        if (!otherWindow) {
            log("error, otherWindow can't be null")
            return
        }
        if (window) {
            window.tile = null
        }
        tile?.remove()
        otherWindow.tile = null
        tileForOtherWindow.remove()
        otherWindow.tile = parentTile
    } else {
        if (window) {
            window.tile = null
        }
        if (tile?.canBeRemoved) {
            tile?.remove()
        }
    }
}


const addWindowToTile = (arg: {
    window: Window,
    screen?: Output
}) => {
    const {window, screen} = arg
    const tileManager = workspace.tilingForScreen(screen ?? window.output)
    const rootTile = tileManager.rootTile
    const windowForRootTile = windowForTile(rootTile);
    if (windowForRootTile) {
        const childTiles = rootTile.split(LayoutDirection.Horizontal)
        windowForRootTile.tile = null
        windowForRootTile.tile = childTiles[0]
        window.tile = childTiles[1]
    } else {
        const childTiles = rootTile.tiles
        if (childTiles.length) {
            let maxSizeTile = childTiles[0]
            childTiles.forEach((childTile) => {
                if (childTile.absoluteGeometry.width > maxSizeTile.absoluteGeometry.width) {
                    maxSizeTile = childTile
                }
            })
            const originWindowForMaxSizeTile = windowForTile(maxSizeTile)
            if (!originWindowForMaxSizeTile) {
                log("error, shouldn't be undefined")
                return
            }
            const newChildTiles = maxSizeTile.split(LayoutDirection.Horizontal)
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
        addWindowToTile({window})
    })
    log(`------ info of screen ${screen.name} after tile ------`)
    logTileTreeInfo(tileManager.rootTile)
    log(`------ end info of screen ${screen.name} ------`)
}

