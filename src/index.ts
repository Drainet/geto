import {
    isApplicationWindow,
    cleanUpTiles,
    log,
    logTileTreeInfo, windowForTile,
} from "./util";
import {TileHelper} from "./tile_helper";
import {windowMinimizedChangedHandler, windowOutputChangedHandler} from "./signal_handlers";
import {LayoutDirection} from "./layout_direction";

log("------------------ new geto kwin script session started ------------------")

workspace.windowAdded.connect((window) => {
    if (isApplicationWindow(window)) {
        TileHelper.addWindowToScreen({window})
        window.minimizedChanged.connect(windowMinimizedChangedHandler(window))
        window.outputChanged.connect(windowOutputChangedHandler(window))
    }
})

workspace.windowRemoved.connect((window) => {
    if (isApplicationWindow(window)) {
        TileHelper.removeFromTile({window})
    }
})

workspace.windowList().forEach((window) => {
    window.tile = null
    window.minimizedChanged.connect(windowMinimizedChangedHandler(window))
    window.outputChanged.connect(windowOutputChangedHandler(window))
})

TileHelper.resetAllWindowTiles()

const enlargeWindow = () => {
    log("enlarge window")
}
const moveWindowLeft = () => {
    const activeWindow = workspace.activeWindow
    const tile = workspace.activeWindow?.tile
    const parentTile = tile?.parent
    const sameLevelTiles = parentTile?.tiles
    if (activeWindow && tile && parentTile && sameLevelTiles?.length) {
        const currentWindowIndex = sameLevelTiles.indexOf(tile)
        const otherWindowIndex = (currentWindowIndex + 1) % 2
        const otherWindowTile = sameLevelTiles[otherWindowIndex];
        const otherWindow = windowForTile(otherWindowTile)
        if (otherWindow && otherWindowTile.absoluteGeometry.x < tile.absoluteGeometry.x) {
            otherWindow.tile = null
            activeWindow.tile = null
            otherWindow.tile = tile
            activeWindow.tile = otherWindowTile
        }
    }
}
const moveWindowRight = () => {
    const activeWindow = workspace.activeWindow
    const tile = workspace.activeWindow?.tile
    const parentTile = tile?.parent
    const sameLevelTiles = parentTile?.tiles
    if (activeWindow && tile && parentTile && sameLevelTiles?.length) {
        const currentWindowIndex = sameLevelTiles.indexOf(tile)
        const otherWindowIndex = (currentWindowIndex + 1) % 2
        const otherWindowTile = sameLevelTiles[otherWindowIndex];
        const otherWindow = windowForTile(otherWindowTile)
        if (otherWindow && otherWindowTile.absoluteGeometry.x > tile.absoluteGeometry.x) {
            otherWindow.tile = null
            activeWindow.tile = null
            otherWindow.tile = tile
            activeWindow.tile = otherWindowTile
        }
    }
}
const moveWindowUp = () => {
    const activeWindow = workspace.activeWindow
    const tile = workspace.activeWindow?.tile
    const parentTile = tile?.parent
    const sameLevelTiles = parentTile?.tiles
    if (activeWindow && tile && parentTile && sameLevelTiles?.length) {
        const currentWindowIndex = sameLevelTiles.indexOf(tile)
        const otherWindowIndex = (currentWindowIndex + 1) % 2
        const otherWindowTile = sameLevelTiles[otherWindowIndex];
        const otherWindow = windowForTile(otherWindowTile)
        if (otherWindow && otherWindowTile.absoluteGeometry.y === tile.absoluteGeometry.y) {
            otherWindow.tile = null
            activeWindow.tile = null
            tile.remove()
            otherWindowTile.remove()
            const childTiles = parentTile.split(LayoutDirection.Vertical)
            otherWindow.tile = childTiles[0]
            activeWindow.tile = childTiles[1]
            const screen = activeWindow.output
            const tileManager = workspace.tilingForScreen(screen)
            logTileTreeInfo(tileManager.rootTile)
        }
    }
}
const moveWindowDown = () => {
    log("moveWindowDown")
}

registerShortcut("EnlargeWindow", "EnlargeWindow", "", enlargeWindow)
registerShortcut("MoveWindowLeft", "MoveWindowLeft", "", moveWindowLeft)
registerShortcut("MoveWindowRight", "MoveWindowRight", "", moveWindowRight)
registerShortcut("MoveWindowUp", "MoveWindowUp", "", moveWindowUp)
registerShortcut("MoveWindowDown", "MoveWindowDown", "", moveWindowDown)
