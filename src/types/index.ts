export interface Mark {
    letter: string;
    filePath: string;
}

export interface Settings {
    hideMarkListDuringInput?: boolean;
    markListUp?: string;
    markListDown?: string;
    markListSelect?: string;
    markChangeUndo?: string;
    openMarkInNewTab?: boolean; // If true, open mark in new tab, else in current tab
    markListDelete?: string;
    registerList: string; // All letters that should be used as registers
    registerSortByList?: boolean; // If true, sort registers by the order of the letters in the registerList
    harpoonRegisterList: string; // All letters that should be used as registers for the Harpoon feature
    harpoonRegisterSortByList?: boolean;
    harpoonRegisterGapRemoval?: boolean;
    experimentalGoto: boolean;
}

export interface Keybinds {
    up: string[];
    down: string[];
    delete: string[];
    undo: string[];
}