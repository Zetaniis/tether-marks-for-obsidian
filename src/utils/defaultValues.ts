import { Keybinds } from "../types";

export const modalDefaultKeybinds: Keybinds = {
    up: ['ctrl+k', 'ctrl+p'] as string[],
    down: ['ctrl+j', 'ctrl+n'] as string[],
    delete: ['ctrl+d'] as string[],
    undo: ['ctrl+u'] as string[],
}

export const modalDefaultKeybindsMac: Keybinds = {
    up: ['cmd+k', 'cmd+p'] as string[],
    down: ['cmd+j', 'cmd+n'] as string[],
    delete: ['cmd+d'] as string[],
    undo: ['cmd+u'] as string[],
}

export const modalPlaceholderMessages = {
    set: 'Select a mark to set',
    goto: 'Select a mark to go to',
    delete: 'Select a mark to delete',
};

export type Mode = 'set' | 'goto' | 'delete';

export const defaultSettings = {
    hideMarkListDuringInput: false,
    modalListUp: '',
    modalListDown: '',
    modalListSelect: '',
    modalChangeUndo: '',
    modalListDelete: '',
    openMarkInNewTab: false, // If true, open mark in new tab, else in current tab
    registerList: 'abcdefghijklmnopqrstuvwxyz',
    registerSortByList: true,
    harpoonRegisterList: 'qwer',
    harpoonRegisterSortByList: true,
    harpoonRegisterGapRemoval: true,
    experimentalGoto: false,
};

export const modalInstructionElClass = 'modal-instruction-el';
export const modalMarkSymbolClass = 'mark-symbol';
export const modalMarkFilepathClass = 'mark-file-path';
