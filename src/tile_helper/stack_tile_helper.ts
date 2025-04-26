import {TileHelper} from "./tile_helper";
import {log} from "../util";
import {LayoutDirection, QtEdge} from "../kwin_enum";

const removeFromTile = (
    arg: { window: Window } | { tile: Tile }
) => {

}

const addWindowToScreen = (arg: {
    window: Window,
    screen?: Output
}) => {
    const window = workspace.activeWindow
    const screen = window?.output
    if (screen) {
        const tileManager = workspace.tilingForScreen(screen)
        tileManager.rootTile.split(LayoutDirection.Floating)
        const rootTile = tileManager.rootTile
        const tile = tileManager.rootTile.tiles[0]
        const rootWidth = rootTile.absoluteGeometry.width
        const rootHeight = rootTile.absoluteGeometry.height
        const xTarget = 20 - (tile.relativeGeometry.x * rootWidth)
        const yTarget = 20 - (tile.relativeGeometry.y * rootHeight)
        const aRect = tile.absoluteGeometry
        const rRect = tile.relativeGeometry
        log(`x: ${aRect.x}, y ${aRect.y}, width: ${aRect.width}, height: ${aRect.height}`)
        log(`x: ${rRect.x}, y ${rRect.y}, width: ${rRect.width}, height: ${rRect.height}`)
        log(`x target: ${xTarget}`)
        log(`y target: ${yTarget}`)
        tile.resizeByPixels(yTarget, QtEdge.Top)
        tile.resizeByPixels(xTarget, QtEdge.Left)
        const widthTarget = (rootTile.absoluteGeometry.width - 40) - (tile.relativeGeometry.width * rootWidth)
        const heightTarget = (rootTile.absoluteGeometry.height - 40) - (tile.relativeGeometry.height * rootHeight)
        tile.resizeByPixels(widthTarget, QtEdge.Right)
        tile.resizeByPixels(heightTarget, QtEdge.Bottom)
        log(`width target: ${widthTarget}`)
        log(`height target: ${heightTarget}`)
    }
}

const addWindowToTile = (arg: {
    window: Window,
    tile: Tile
}) => {

}

const moveWindowToDirection = (arg: {
    window: Window | undefined,
    shouldSwitchWithOther: (tileRect: Rect, otherTileRect: Rect) => boolean
    shouldChangeLayoutDirection: (tileRect: Rect, otherTileRect: Rect) =>
        { should: boolean, indexAfterChangeLayoutDirection: number }
}) => {

}

const moveWindowLeft = () => {

}

const moveWindowRight = () => {

}

const moveWindowDown = () => {

}

const moveWindowUp = () => {

}

export const StackTileHelper: TileHelper = {
    addWindowToScreen,
    removeFromTile,
    moveWindowLeft,
    moveWindowRight,
    moveWindowUp,
    moveWindowDown,
}