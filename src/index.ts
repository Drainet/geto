import {isApplicationWindow, log, TileUtil} from "./util";
import {TileMode} from "./tile_helper";
import {windowMinimizedChangedHandler, windowOutputChangedHandler} from "./signal_handlers";
import {TileHelperProvider} from "./tile_helper/tile_helper_provider";

log("------------------ new geto kwin script session started ------------------")

let currentTileMode = TileMode.Default

workspace.windowAdded.connect((window) => {
    if (isApplicationWindow(window)) {
        TileHelperProvider[currentTileMode].addWindowToScreen({window})
        window.minimizedChanged.connect(windowMinimizedChangedHandler({
            window,
            tileHelperProvider: TileHelperProvider,
            currentTileModeProvider: () => {
                return currentTileMode
            }
        }))
        window.outputChanged.connect(windowOutputChangedHandler({
            window,
            tileHelperProvider: TileHelperProvider,
            currentTileModeProvider: () => {
                return currentTileMode
            }
        }))
    }
})

workspace.windowRemoved.connect((window) => {
    if (isApplicationWindow(window)) {
        TileHelperProvider[currentTileMode].removeFromTile({window})
    }
})

workspace.windowActivated.connect((window) => {
    if (isApplicationWindow(window)) {
        TileHelperProvider[currentTileMode].handleWindowActivated(window)
    }
})

workspace.windowList().forEach((window) => {
    window.tile = null
    window.minimizedChanged.connect(windowMinimizedChangedHandler({
        window,
        tileHelperProvider: TileHelperProvider,
        currentTileModeProvider: () => {
            return currentTileMode
        }
    }))
    window.outputChanged.connect(windowOutputChangedHandler({
        window,
        tileHelperProvider: TileHelperProvider,
        currentTileModeProvider: () => {
            return currentTileMode
        }
    }))
})


const enlargeWindow = () => {
    log("enlarge window")
}

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


const switchMode = () => {
    workspace.screens.forEach((screen) => {
        const tileManager = workspace.tilingForScreen(screen)
        TileUtil.cleanUpTiles(tileManager.rootTile)
    })
    if (currentTileMode === TileMode.Default) {
        currentTileMode = TileMode.Stack
    } else if (currentTileMode === TileMode.Stack){
        currentTileMode = TileMode.Queue
    } else {
        currentTileMode = TileMode.Default
    }
    TileUtil.resetAllWindowTiles(TileHelperProvider[currentTileMode])
}

registerShortcut("GetoEnlargeWindow", "GetoEnlargeWindow", "", enlargeWindow)
registerShortcut("GetoMoveWindowLeft", "GetoMoveWindowLeft", "", () => {
    TileHelperProvider[currentTileMode].moveWindowLeft()
})
registerShortcut("GetoMoveWindowRight", "GetoMoveWindowRight", "", () => {
    TileHelperProvider[currentTileMode].moveWindowRight()
})
registerShortcut("GetoMoveWindowUp", "GetoMoveWindowUp", "", () => {
    TileHelperProvider[currentTileMode].moveWindowUp()
})
registerShortcut("GetoMoveWindowDown", "GetoMoveWindowDown", "", () => {
    TileHelperProvider[currentTileMode].moveWindowDown()
})
registerShortcut("GetoResetAllTiles", "GetoResetAllTiles", "", () => {
    TileUtil.resetAllWindowTiles(TileHelperProvider[currentTileMode])
})
registerShortcut("GetoUnMinimizePrevMinimizedWindow", "GetoUnMinimizePrevMinimizedWindow", "", unMinimizePrevMinimizedWindow)
registerShortcut("GetoSwitchMode", "GetoSwitchMode", "", switchMode)

TileUtil.resetAllWindowTiles(TileHelperProvider[currentTileMode])
