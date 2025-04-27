import {log, logTileTreeInfo, TileUtil} from "../util";
import {LayoutDirection} from "../kwin_enum";
import {TileHelper} from "./tile_helper";

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
        const otherWindow = TileUtil.windowForTile(tileForOtherWindow)
        log(`other window name: ${otherWindow?.resourceName}, current window name: ${window?.resourceName}`)
        if (!otherWindow) {
            log("error, otherWindow can't be null")
            TileUtil.resetAllWindowTiles(DefaultTileHelper)
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

const addWindowToScreen = (arg: {
    window: Window,
    screen?: Output
}) => {
    const {window, screen} = arg
    const tileManager = workspace.tilingForScreen(screen ?? window.output)
    const rootTile = tileManager.rootTile
    addWindowToTile({window, tile: rootTile})
}

const addWindowToTile = (arg: {
    window: Window,
    tile: Tile
}) => {
    const {window, tile} = arg
    const windowForRootTile = TileUtil.windowForTile(tile);
    if (windowForRootTile) {
        let splitDirection: LayoutDirection
        if (!tile.parent) {
            splitDirection = LayoutDirection.Horizontal
        } else {
            const sameLevelTiles = tile.parent.tiles
            const xDiff = sameLevelTiles[0].absoluteGeometry.x - sameLevelTiles[1].absoluteGeometry.x
            if (xDiff !== 0) {
                splitDirection = LayoutDirection.Vertical
            } else {
                splitDirection = LayoutDirection.Horizontal
            }
        }
        const childTiles = tile.split(splitDirection)
        windowForRootTile.tile = null
        windowForRootTile.tile = childTiles[0]
        window.tile = childTiles[1]
    } else {
        const childTiles = tile.tiles
        if (childTiles.length) {
            const getChildCount = (tile: Tile) => {
                return TileUtil.collectAllTiles(tile).filter(tile => !tile.isLayout).length
            }
            if (getChildCount(childTiles[0]) > getChildCount(childTiles[1])) {
                addWindowToTile({window, tile: childTiles[1]})
            } else {
                addWindowToTile({window, tile: childTiles[0]})
            }
        } else {
            window.tile = tile
        }
    }
}

const moveWindowToDirection = (arg: {
    window: Window | undefined,
    shouldSwitchWithOther: (tileRect: Rect, otherTileRect: Rect) => boolean
    shouldChangeLayoutDirection: (tileRect: Rect, otherTileRect: Rect) =>
        { should: boolean, indexAfterChangeLayoutDirection: number }
}) => {
    const {window, shouldSwitchWithOther, shouldChangeLayoutDirection} = arg
    const tile = window?.tile
    const parentTile = tile?.parent
    const sameLevelTiles = parentTile?.tiles
    if (window && tile && parentTile && sameLevelTiles?.length) {
        const currentWindowIndex = sameLevelTiles.indexOf(tile)
        const otherWindowIndex = (currentWindowIndex + 1) % 2
        const otherWindowTile = sameLevelTiles[otherWindowIndex];
        const otherWindow = TileUtil.windowForTile(otherWindowTile)
        const {
            should: shouldChangeLayout,
            indexAfterChangeLayoutDirection
        } = shouldChangeLayoutDirection(tile.absoluteGeometry, otherWindowTile.absoluteGeometry)
        if (otherWindow && shouldChangeLayout) {
            const newLayoutDirection = tile.absoluteGeometry.y === otherWindowTile.absoluteGeometry.y ?
                LayoutDirection.Vertical : LayoutDirection.Horizontal
            otherWindow.tile = null
            window.tile = null
            tile.remove()
            otherWindowTile.remove()
            const childTiles = parentTile.split(newLayoutDirection)
            otherWindow.tile = childTiles[(indexAfterChangeLayoutDirection + 1) % 2]
            window.tile = childTiles[indexAfterChangeLayoutDirection]
        } else if (otherWindow && shouldSwitchWithOther(tile.absoluteGeometry, otherWindowTile.absoluteGeometry)) {
            otherWindow.tile = null
            window.tile = null
            otherWindow.tile = tile
            window.tile = otherWindowTile
        }
        const screen = window.output
        const tileManager = workspace.tilingForScreen(screen)
        logTileTreeInfo(tileManager.rootTile)
    }
}

const moveWindowLeft = () => {
    moveWindowToDirection({
        window: workspace.activeWindow,
        shouldSwitchWithOther: (tileRect, otherTileRect) =>
            tileRect.x > otherTileRect.x,
        shouldChangeLayoutDirection: (tileRect, otherTileRect) => {
            return {
                should: tileRect.x === otherTileRect.x,
                indexAfterChangeLayoutDirection: 0
            }
        }
    })
}

const moveWindowRight = () => {
    moveWindowToDirection({
        window: workspace.activeWindow,
        shouldSwitchWithOther: (tileRect, otherTileRect) =>
            tileRect.x < otherTileRect.x,
        shouldChangeLayoutDirection: (tileRect, otherTileRect) => {
            return {
                should: tileRect.x === otherTileRect.x,
                indexAfterChangeLayoutDirection: 1
            }
        }
    })

}

const moveWindowDown = () => {
    moveWindowToDirection({
        window: workspace.activeWindow,
        shouldSwitchWithOther: (tileRect, otherTileRect) =>
            tileRect.y < otherTileRect.y,
        shouldChangeLayoutDirection: (tileRect, otherTileRect) => {
            return {
                should: tileRect.y === otherTileRect.y,
                indexAfterChangeLayoutDirection: 1
            }
        }
    })
}

const moveWindowUp = () => {
    moveWindowToDirection({
        window: workspace.activeWindow,
        shouldSwitchWithOther: (tileRect, otherTileRect) =>
            tileRect.y > otherTileRect.y,
        shouldChangeLayoutDirection: (tileRect, otherTileRect) => {
            return {
                should: tileRect.y === otherTileRect.y,
                indexAfterChangeLayoutDirection: 0
            }
        }
    })
}

const handleWindowActivated = (window: Window) => {

}


export const DefaultTileHelper: TileHelper = {
    addWindowToScreen,
    removeFromTile,
    moveWindowLeft,
    moveWindowRight,
    moveWindowUp,
    moveWindowDown,
    handleWindowActivated
}