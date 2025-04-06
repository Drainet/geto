import {isApplicationWindow, log} from "./util";

log("--workspace window start--")
workspace.windowList()
    .filter(isApplicationWindow)
    .forEach((window) => {
        log(`workspace window: ${window.resourceName} ${window.internalId} ${window.pid}`)
    })
log("--workspace window end--")

workspace.windowAdded.connect((window) => {
    log(`window added: ${window.resourceName} ${window.internalId} ${window.pid}`)
})

workspace.windowRemoved.connect((window) => {
    log(`window removed: ${window.resourceName} ${window.internalId} ${window.pid}`)
})

workspace.windowActivated.connect((window) => {
    log(`window activated: ${window.resourceName} ${window.internalId} ${window.pid}`)
})