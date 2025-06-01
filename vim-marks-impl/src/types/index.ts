export interface Mark {
    letter: string;
    filePath: string;
}

export interface Settings {
    hideMarkListDuringInput: boolean;
    markListUp?: string;
    markListDown?: string;
    markListSelect?: string;
    markListDelete?: string; // <--- Add this line
    openMarkInNewTab?: boolean; // If true, open mark in new tab, else in current tab
}