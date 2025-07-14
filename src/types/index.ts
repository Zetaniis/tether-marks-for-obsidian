export interface Mark {
    symbol: string;
    filePath: string;
}

export interface Settings {
    hideMarkListDuringInput: boolean;
    markListUp?: string;
    markListDown?: string;
    markListSelect?: string;
    markChangeUndo?: string;
    openMarkInNewTab: boolean; // If true, open mark in new tab, else in current tab
    markListDelete?: string;
    registerList: string; // All key symbols that should be used as registers
    registerSortByList: boolean; // If true, sort registers by the order of the key symbols in the registerList
    harpoonRegisterList: string; // All key symbols that should be used as registers for the Harpoon feature
    harpoonRegisterSortByList: boolean;
    harpoonRegisterGapRemoval: boolean;
    experimentalGoto: boolean;
}

export interface ModalKeybinds {
    up: string[];
    down: string[];
    delete: string[];
    undo: string[];
    enter: string[];
}