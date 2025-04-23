export const X_WAYLAND_VIDEO_BRIDGE_RESOURCE_NAME = "xwaylandvideobridge"

export const isApplicationWindow = (window: Window) => {
    return window.minimizable &&
        window.normalWindow &&
        window.opacity !== 0 &&
        !window.skipTaskbar &&
        !window.dialog &&
        !window.popupWindow &&
        !window.popupMenu &&
        !window.splash &&
        !window.utility &&
        !window.specialWindow
}

export const log = (message: string) => {
    console.info(message)
}

export const logWindowInfo = (event: string, window: Window) => {
    log(JSON.stringify({
        event,
        resourceName: window.resourceName,
        isApplicationWindow: isApplicationWindow(window),
        internalId: window.internalId.toString(),
        pid: window.pid,
        windowRole: window.windowRole,
        resourceClass: window.resourceClass,
        windowType: window.windowType,
        stackingOrder: window.stackingOrder,
        closeable: window.closeable,
        frameGeometry: window.frameGeometry,
        skipTaskbar: window.skipTaskbar,
        minSize: window.minSize
    }, null, 2))
}

export const logTileInfo = (event: string, tile: Tile) => {
    log(JSON.stringify({
        event,
        isLayout: tile.isLayout,
        absoluteGeometry: tile.absoluteGeometry,
        windows: tile.windows.map(window => window.resourceName),
        canBeRemoved: tile.canBeRemoved
    }, null, 2))
}


export const collectAllTiles = (tile: Tile): Tile[] => {
    const results: Tile[] = []
    results.push(tile)
    tile.tiles.forEach((tile) => {
        results.push(...collectAllTiles(tile))
    })
    return results
}

const tileExistInTiles = (tile: Tile, rootTile: Tile): boolean => {
    if (tile === rootTile) {
        return true
    }
    for (let i = 0; i < rootTile.tiles.length; i++) {
        const childTile = rootTile.tiles[i]
        const existInChild = tileExistInTiles(tile, childTile)
        if (existInChild) {
            return true
        }
    }
    return false
}

export const screenForTile = (tile: Tile): Output | undefined => {
    for (let i = 0; i < workspace.screens.length; i++) {
        const screen = workspace.screens[i]
        const tileManager = workspace.tilingForScreen(screen)
        if (tileExistInTiles(tile, tileManager.rootTile)) {
            return screen
        }
    }
    return undefined
}

export const windowForTile = (tile: Tile): Window | undefined => {
    const windowList = workspace.windowList()
    for (let i = 0; i < windowList.length; i++) {
        const window = windowList[i]
        if (window.tile === tile) {
            return window
        }
    }
    return undefined
}

export const cleanUpTiles = (rootTile: Tile) => {
    const allRemovableTiles = collectAllTiles(rootTile)
    allRemovableTiles.forEach((tile) => {
        tile.windows.forEach((window) => {
            window.tile = null
        })
        const window = windowForTile(tile)
        if (window) {
            window.tile = null
        }
        if (tile.canBeRemoved) {
            tile.remove()
        }
    })
}

const collectTileTreeInfo = (
    tile: Tile,
    depth: number = 0,
    parentIndex: number,
    currentIndex: number,
    infoArray: string[][]
) => {
    if (depth >= infoArray.length) {
        infoArray.push([])
    }
    const arrayForCurrentDepth = infoArray[depth]
    const rect = tile.absoluteGeometry;
    const windowNames = tile.windows.map((window) => window.resourceName).join(",")
    const debugInfo = `pI: ${parentIndex}, i: ${currentIndex}, r: {x: ${rect.x}, y: ${rect.y}, w: ${rect.width}, h: ${rect.height}}, w: {${windowForTile(tile)?.resourceName}}, l: ${tile.isLayout}, cR: ${tile.canBeRemoved}`
    arrayForCurrentDepth.push(debugInfo)
    for (let i = 0; i < tile.tiles.length; i++) {
        const childTile = tile.tiles[i]
        collectTileTreeInfo(
            childTile,
            depth + 1,
            currentIndex,
            i,
            infoArray
        )
    }
}

export const logTileTreeInfo = (rootTile: Tile) => {
    const infoArray: string[][] = []
    collectTileTreeInfo(rootTile, 0, 0, 0, infoArray)
    infoArray.forEach((infoStrings) => {
        const resultString = `${infoStrings.map((s) => `[${s}]`).join(",\n")} `
        log(resultString)
    })
}