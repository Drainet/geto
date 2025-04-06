export const isApplicationWindow = (window: Window) => {
    return window.minimizable &&
        window.normalWindow &&
        window.opacity !== 0
}

export const log = (message: string) => {
    console.info(message)
}

