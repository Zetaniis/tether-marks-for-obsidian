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
}

export interface Keybinds {
    up: string[];
    down: string[];
    delete: string[];
}