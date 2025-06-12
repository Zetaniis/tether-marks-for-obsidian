export interface Mark {
    letter: string;
    filePath: string;
}

export interface Settings {
    hideMarkListDuringInput: boolean;
    markListUp?: string;
    markListDown?: string;
    markListSelect?: string;
    openMarkInNewTab?: boolean; // If true, open mark in new tab, else in current tab
    markListDelete?: string;
    registerList: string; // All letters that should be used as registers
    harpoonRegisterList: string; // All letters that should be used as registers for the Harpoon feature
}

export interface Keybinds {
    up: string[];
    down: string[];
    delete: string[];
}