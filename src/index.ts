import {
    isApplicationWindow,
    log, logTileTreeInfo,
} from "./util";
import {TileHelper} from "./tile_helper";
import {LayoutDirection, QtEdge} from "./kwin_enum";
import {windowMinimizedChangedHandler, windowOutputChangedHandler} from "./signal_handlers";

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


const enlargeWindow = () => {
    log("enlarge window")
}

const moveWindowLeft = () => TileHelper.moveWindowToDirection({
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

const moveWindowRight = () => TileHelper.moveWindowToDirection({
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

const moveWindowUp = () => TileHelper.moveWindowToDirection({
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

const moveWindowDown = () => TileHelper.moveWindowToDirection({
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


const unMinimizePrevMinimizedWindow = () => {
    const minimizedWindows = workspace.windowList()
        .filter(isApplicationWindow)
        .filter((window) => window.minimized)
    let targetWindow: Window | undefined
    for (let i = 0; i < minimizedWindows.length; i++) {
        const current = minimizedWindows[i]
        if ((current.minimizedDate?.getTime() ?? 0) > (targetWindow?.minimizedDate?.getTime() ?? 0)) {
            targetWindow = current
        }
    }
    if (targetWindow) {
        targetWindow.minimized = false
    }
}


registerShortcut("GetoEnlargeWindow", "GetoEnlargeWindow", "", enlargeWindow)
registerShortcut("GetoMoveWindowLeft", "GetoMoveWindowLeft", "", moveWindowLeft)
registerShortcut("GetoMoveWindowRight", "GetoMoveWindowRight", "", moveWindowRight)
registerShortcut("GetoMoveWindowUp", "GetoMoveWindowUp", "", moveWindowUp)
registerShortcut("GetoMoveWindowDown", "GetoMoveWindowDown", "", moveWindowDown)
registerShortcut("GetoResetAllTiles", "GetoResetAllTiles", "", TileHelper.resetAllWindowTiles)
registerShortcut("GetoUnMinimizePrevMinimizedWindow", "GetoUnMinimizePrevMinimizedWindow", "", unMinimizePrevMinimizedWindow)

TileHelper.resetAllWindowTiles()
