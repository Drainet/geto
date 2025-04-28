import {TileHelper} from "./tile_helper";
import {log, TileUtil} from "../util";
import {LayoutDirection, QtEdge} from "../kwin_enum";
import {TileMode} from "./tile_mode";

const removeFromTile = (
    arg: { window: Window } | { tile: Tile }
) => {
    TileUtil.resetAllWindowTiles(QueueTileHelper)
}

const addWindowToScreen = (arg: {
    window: Window,
    screen?: Output
}) => {
    const {window} = arg
    const tileManager = workspace.tilingForScreen(window.output)
    const rootTile: Tile = tileManager.rootTile
    const screen = window?.output
    if (screen) {
        rootTile.split(LayoutDirection.Floating)
        const tileCount = rootTile.tiles.length
        const tile = rootTile.tiles[tileCount - 1]
        const rootWidth = rootTile.absoluteGeometry.width
        const rootHeight = rootTile.absoluteGeometry.height
        const xResizeDiff = (40 * (tileCount - 1)) - (tile.relativeGeometry.x * rootWidth)
        const yResizeDiff = 0 - (tile.relativeGeometry.y * rootHeight)
        tile.resizeByPixels(yResizeDiff, QtEdge.Top)
        tile.resizeByPixels(xResizeDiff, QtEdge.Left)
        const targetWidth = rootTile.absoluteGeometry.width - (40 * (tileCount - 1));
        const widthResizeDiff = targetWidth - (tile.relativeGeometry.width * rootWidth)
        const heightResizeDiff = rootTile.absoluteGeometry.height - (tile.relativeGeometry.height * rootHeight)
        tile.resizeByPixels(widthResizeDiff, QtEdge.Right)
        tile.resizeByPixels(heightResizeDiff, QtEdge.Bottom)
        window.tile = null
        window.tile = tile
        rootTile.tiles.forEach((tile) => {
            const widthResizeDiff = targetWidth - (tile.relativeGeometry.width * rootWidth)
            tile.resizeByPixels(widthResizeDiff, QtEdge.Right)
            const window = TileUtil.windowForTile(tile)
            if (window) {
                window.tile = null
                window.tile = tile
            }
        })
    }
}

const moveWindowLeft = () => {
    const window = workspace.activeWindow
    if (window && window?.output && window.tile) {
        const tile = window.tile
        const tileManager = workspace.tilingForScreen(window.output)
        const rootTile: Tile = tileManager.rootTile
        const tiles = rootTile.tiles
        const index = tiles.indexOf(window.tile)
        if (index !== 0) {
            const leftTile = tiles[index - 1]
            const leftWindow = TileUtil.windowForTile(leftTile)
            if (leftWindow) {
                leftWindow.tile = null
                window.tile = null
                leftWindow.tile = tile
                window.tile = leftTile
                handleWindowActivated(window)
            }
        }
    }
}

const moveWindowRight = () => {
    const window = workspace.activeWindow
    if (window && window?.output && window.tile) {
        const tile = window.tile
        const tileManager = workspace.tilingForScreen(window.output)
        const rootTile: Tile = tileManager.rootTile
        const tiles = rootTile.tiles
        const index = tiles.indexOf(window.tile)
        if (index !== tiles.length - 1) {
            const rightTile = tiles[index + 1]
            const rightWindow = TileUtil.windowForTile(rightTile)
            if (rightWindow) {
                rightWindow.tile = null
                window.tile = null
                rightWindow.tile = tile
                window.tile = rightTile
                handleWindowActivated(window)
            }
        }
    }
}

const moveWindowDown = () => {

}

const moveWindowUp = () => {

}

const handleWindowActivated = (window: Window) => {
    const tileManager = workspace.tilingForScreen(window.output)
    const rootTile: Tile = tileManager.rootTile
    const allWindows = rootTile.tiles.map((tile) => {
        const window = TileUtil.windowForTile(tile)
        if (!window) {
            throw Error("tile with null window")
        } else {
            return window
        }
    })
    const index = allWindows.indexOf(window)
    for (let i = allWindows.length - 1; i > index; i--) {
        const window = allWindows[i]
        workspace.raiseWindow(window)
    }
    for (let i = 0; i < index; i++) {
        const window = allWindows[i]
        workspace.raiseWindow(window)
    }
    workspace.raiseWindow(window)
}

export const QueueTileHelper: TileHelper = {
    addWindowToScreen,
    removeFromTile,
    moveWindowLeft,
    moveWindowRight,
    moveWindowUp,
    moveWindowDown,
    handleWindowActivated
}