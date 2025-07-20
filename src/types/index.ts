export interface Mark {
    symbol: string;
    filePath: string;
}

export interface Settings {
    experimentalGoto: boolean;
    openMarkInNewTab: boolean; // If true, open mark in new tab, else in current tab
    // hideMarkListDuringInput: boolean;
    registerList: string; // All key symbols that should be used as registers
    registerSortByList: boolean; // If true, sort registers by the order of the key symbols in the registerList
    harpoonRegisterList: string; // All key symbols that should be used as registers for the Harpoon feature
    harpoonRegisterSortByList: boolean;
    harpoonRegisterGapRemoval: boolean;
    modalListUp: string;
    modalListDown: string;
    modalListSelect: string;
    modalListCancel: string;
    modalListDelete: string,
    modalListUndo: string,
}

export interface ModalKeybinds {
    up: string[];
    down: string[];
    delete: string[];
    select: string[];
    cancel: string[];
    undo: string[];
}

export type Mode = 'set' | 'goto' | 'delete';
