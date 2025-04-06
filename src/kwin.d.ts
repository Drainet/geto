interface Signal<T> {
    connect(callback: (t:T) => void)
}

declare const KWin

declare const workspace: {
    windowList(): Window[];
    windowAdded: Signal<Window>
    windowRemoved: Signal<Window>
    windowActivated: Signal<Window>
    activateWindow(window: Window)
    currentDesktop: number
    activeWindow?: Window
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
}

declare function registerShortcut(title: string, text: string, keySequence: string, callback: () => void)

