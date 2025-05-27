import {TileHelper} from "./tile_helper";
import {TileUtil} from "../util";
import {LayoutDirection, QtEdge} from "../kwin_enum";

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

        let insertIndex = tileCount - 1
        let previousActiveWindow: Window | undefined
        if (workspace.activeWindow === window) {
            if (tileCount > 1) {
                previousActiveWindow = rootTile.tiles
                    .map((tile) => TileUtil.windowForTile(tile))
                    .filter((window): window is Window => !!window && window.output === screen)
                    .reduce<Window | undefined>((latestWindow, currentWindow) => {
                        if (!latestWindow ||
                            (currentWindow.lastActivatedDate &&
                             (!latestWindow.lastActivatedDate ||
                              currentWindow.lastActivatedDate > latestWindow.lastActivatedDate))) {
                            return currentWindow;
                        }
                        return latestWindow;
                    }, undefined);
            } else {
                previousActiveWindow = undefined
            }
        } else {
            previousActiveWindow = workspace.activeWindow
        }
        if (previousActiveWindow && previousActiveWindow.output === screen && previousActiveWindow.tile) {
            const activeWindowIndex = rootTile.tiles.indexOf(previousActiveWindow.tile)
            if (activeWindowIndex !== -1) {
                insertIndex = activeWindowIndex + 1
            }
        }

        if (insertIndex < tileCount - 1) {
            const windowsToBeShifted: Window[] = []
            for (let i = insertIndex; i < tileCount - 1; i++) {
                const currentTile = rootTile.tiles[i]
                const tileWindow = TileUtil.windowForTile(currentTile)
                if (tileWindow) {
                    windowsToBeShifted.push(tileWindow)
                }
            }

            for (let i = 0; i < windowsToBeShifted.length; i++) {
                const tileWindow = windowsToBeShifted[i]
                const nextTile = rootTile.tiles[insertIndex + i + 1]
                tileWindow.tile = null
                tileWindow.tile = nextTile
            }

            window.tile = null
            window.tile = rootTile.tiles[insertIndex]
        } else {
            window.tile = null
            window.tile = rootTile.tiles[tileCount - 1]
        }
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
    if (window === workspace.activeWindow) {
        handleWindowActivated(window)
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
