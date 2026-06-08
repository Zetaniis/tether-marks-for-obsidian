import { BasicMarksSettings, Mark } from "tether-marks-core";

export interface ModalKeybinds {
    up: string[];
    down: string[];
    delete: string[];
    select: string[];
    altSelect: string[];
    cancel: string[];
    undo: string[];
    redo: string[];
}

export interface ObsidianMarksSettings extends BasicMarksSettings {
    experimentalGoto: boolean;
    openMarkInNewTab: boolean; // If true, open mark in new tab, else in current tab
    hidePathInfo: boolean;
    passthroughMode: boolean;
    modalListUp: string;
    modalListDown: string;
    modalListSelect: string;
    modalListAltSelect: string;
    modalListCancel: string;
    modalListDelete: string,
    modalListUndo: string,
    modalListRedo: string,
}

export type SnapshotModalMode = "save" | "load" | "delete";

export const snapshotModalModeDescription: Record<SnapshotModalMode, string> = {
    "save": "Save/overwrite selected snapshot",
    "load": "Load selected snapshot",
    "delete": "Delete snapshot",
};

export type Snapshot = {
    name: string;
    marks: Mark[];
}
