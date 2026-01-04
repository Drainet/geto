import type { CommonTile } from "../tile_common";

export type TileHelper = {
  addWindowToScreen: (arg: { window: Window; screen?: Output }) => void;
  removeFromTile: (arg: { window: Window } | { tile: CommonTile }) => void;
  moveWindowLeft: () => void;
  moveWindowRight: () => void;
  moveWindowUp: () => void;
  moveWindowDown: () => void;
  handleWindowActivated: (window: Window) => void;
};
