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
