import {TileHelper} from "../tile_helper";

export const windowOutputChangedHandler = (window: Window) => () => {
    TileHelper.removeNoWindowTiles()
    TileHelper.addWindowToScreen({window})
}