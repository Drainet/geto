import {TileHelper} from "../tile_management";

export const windowOutputChangedHandler = (window: Window) => () => {
    TileHelper.removeNoWindowTiles()
    TileHelper.addWindowToTile({window})
}