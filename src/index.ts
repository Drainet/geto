import {isApplicationWindow, log, logWindowInfo} from "./util";

log("--workspace window start--")
workspace.windowList()
    .filter(isApplicationWindow)
    .forEach((window) => {
        logWindowInfo("Listed from workspace", window)
    })
log("--workspace window end--")

workspace.windowAdded.connect((window) => {
    logWindowInfo("Window Added", window)
})

workspace.windowRemoved.connect((window) => {
    logWindowInfo("Window Removed", window)
})

workspace.windowActivated.connect((window) => {
    logWindowInfo("Window Activated", window)
})
