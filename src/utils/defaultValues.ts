import { Keybinds } from "../types";

export const defaultKeybinds: Keybinds = {
    up: ['ctrl+k', 'ctrl+p'] as string[],
    down: ['ctrl+j', 'ctrl+n'] as string[],
    delete: ['ctrl+d'] as string[],
    undo: ['ctrl+u'] as string[],
}

export const defaultKeybindsMac: Keybinds = {
    up: ['cmd+k', 'cmd+p'] as string[],
    down: ['cmd+j', 'cmd+n'] as string[],
    delete: ['cmd+d'] as string[],
    undo: ['cmd+u'] as string[],
}

export const placeholderMessages = {
    set: 'Select a mark to set',
    goto: 'Select a mark to go to',
    delete: 'Select a mark to delete',
};

export type Mode = 'set' | 'goto' | 'delete';

export const defaultSettings = {
    hideMarkListDuringInput: false,
    markListUp: '',
    markListDown: '',
    markListSelect: '',
    markChangeUndo: '',
    markListDelete: '',
    openMarkInNewTab: false, // If true, open mark in new tab, else in current tab
    registerList: 'abcdefghijklmnopqrstuvwxyz',
    registerSortByList: true,
    harpoonRegisterList: 'qwer',
    harpoonRegisterSortByList: true,
    harpoonRegisterGapRemoval: true,
    experimentalGoto: false,
};

export const modalInstructionElClass = 'modal-instruction-el';
export const modalMarkLetterClass = 'mark-letter';
export const modalMarkFilepathClass = 'mark-file-path';
