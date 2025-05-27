interface Signal<T> {
    connect(callback: (t: T) => void)
}

declare const KWin

declare const console: {
    info(text: string)
}

declare const workspace: {
    windowList(): Window[];
    windowAdded: Signal<Window>
    windowRemoved: Signal<Window>
    windowActivated: Signal<Window>
    activateWindow(window: Window)
    currentDesktop: number
    activeWindow?: Window,
    screens: Output[]
    stackingOrder: Window[]
    raiseWindow(window: Window)
    tilingForScreen: (output: Output) => TileManager
}

interface Output {
    geometry: Rect,
    devicePixelRatio: number
    name: string
}

interface Tile {
    absoluteGeometry: Rect
    relativeGeometry: Rect
    resizeByPixels: (size: number, edge: number) => void
    windows: Window[]
    tiles: Tile[]
    split: (direction: number) => Tile[]
    isLayout: boolean
    canBeRemoved: boolean
    remove: () => void
    parent: Tile | null
}

interface TileManager {
    rootTile: Tile
}

interface Rect {
    x: number
    y: number
    width: number
    height: number
}

interface Size {
    width: number
    height: number
}

interface Window {
    minimizable: boolean
    normalWindow: boolean
    opacity: number
    minimized: boolean
    active: boolean
    resourceName: string
    minimizedChanged: Signal<void>
    outputChanged: Signal<void>
    internalId: string
    pid: number
    windowRole: string
    resourceClass: string
    windowType: number
    stackingOrder: number
    closeable: boolean
    frameGeometry: Rect
    skipTaskbar: boolean
    skipPager: boolean
    skipSwitcher: boolean
    minSize: Size
    tile?: Tile | null
    output: Output
    splash: boolean
    utility: boolean
    popupWindow: boolean
    popupMenu: boolean
    dialog: boolean
    specialWindow: boolean

    //custom property, not from kwin
    minimizedDate?: Date
    lastActivatedDate?: Date
}

declare function registerShortcut(title: string, text: string, keySequence: string, callback: () => void)

