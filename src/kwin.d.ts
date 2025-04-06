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
    tilingForScreen: (output: Output) => TileManager
}

interface Output {
}

interface TileManager {
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
}

declare function registerShortcut(title: string, text: string, keySequence: string, callback: () => void)

