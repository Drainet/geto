export const X_WAYLAND_VIDEO_BRIDGE_RESOURCE_NAME = "xwaylandvideobridge"

export const isApplicationWindow = (window: Window) => {
    return window.minimizable &&
        window.normalWindow &&
        window.opacity !== 0 &&
        !window.skipTaskbar
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

