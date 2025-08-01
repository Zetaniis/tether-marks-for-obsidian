import { BasicMarksSettings } from "tether-marks-core";

export interface ModalKeybinds {
    up: string[];
    down: string[];
    delete: string[];
    select: string[];
    cancel: string[];
    undo: string[];
}

export interface ObsidianMarksSettings extends BasicMarksSettings {
    experimentalGoto: boolean;
    openMarkInNewTab: boolean; // If true, open mark in new tab, else in current tab
    // hideMarkListDuringInput: boolean;
    modalListUp: string;
    modalListDown: string;
    modalListSelect: string;
    modalListCancel: string;
    modalListDelete: string,
    modalListUndo: string,
}
