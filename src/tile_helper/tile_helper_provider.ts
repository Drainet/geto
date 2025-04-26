import {TileMode} from "./tile_mode";
import {TileHelper} from "./tile_helper";
import {DefaultTileHelper} from "./default_tile_helper";
import {StackTileHelper} from "./stack_tile_helper";

export const TileHelperProvider: Record<TileMode, TileHelper> = {
    [TileMode.Default]: DefaultTileHelper,
    [TileMode.Stack]: StackTileHelper
}