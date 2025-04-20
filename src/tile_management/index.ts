import {collectAllTiles, log, windowForTile} from "../util";
import {LayoutDirection} from "../layout_direction";

const removeFromTile = (
    arg: { window: Window } | { tile: Tile }
) => {
    const isWindowArg = (arg: any): arg is { window: Window } => {
        return 'window' in arg;
    }
    let window: Window | undefined
    let tile: Tile
    if (isWindowArg(arg)) {
        window = arg.window
        if (!window.tile) {
            log("error, window's tile can't be null")
            return
        }
        tile = window.tile
    } else {
        window = undefined
        tile = arg.tile
    }

    if (!tile) {
        log("error, tile can't be null")
        return
    }
    const parentTile = tile.parent
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

const removeNoWindowTiles = () => {
    workspace.screens.forEach((screen) => {
        const allTiles = collectAllTiles(workspace.tilingForScreen(screen).rootTile)
        allTiles.forEach((tile) => {
            if (!tile.tiles.length && tile.canBeRemoved && !windowForTile(tile)) {
                TileHelper.removeFromTile({tile})
            }
        })
    })
}


export const TileHelper = {
    removeFromTile,
    addWindowToTile,
    removeNoWindowTiles
}