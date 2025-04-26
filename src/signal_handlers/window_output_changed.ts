import {TileHelper, TileMode} from "../tile_helper";
import {TileUtil} from "../util";

export const windowOutputChangedHandler = (arg: {
    window: Window
    tileHelperProvider: Record<TileMode, TileHelper>,
    currentTileModeProvider: () => TileMode
}) => () => {
    const {window, tileHelperProvider, currentTileModeProvider} = arg
    const currentTileMode = currentTileModeProvider()
    const tileHelper = tileHelperProvider[currentTileMode]
    TileUtil.removeNoWindowTiles(tileHelper)
    tileHelper.addWindowToScreen({window})
}