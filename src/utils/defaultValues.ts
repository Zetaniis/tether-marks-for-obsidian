import { ModalKeybinds, Settings, Mode } from "../types";

export const modalDefaultKeybinds: ModalKeybinds = {
    up: ['ctrl+k', 'ctrl+p'] as string[],
    down: ['ctrl+j', 'ctrl+n'] as string[],
    delete: ['ctrl+d'] as string[],
    select: ['Enter'] as string[],
    cancel: ['Escape'] as string[],
}

export const modalDefaultKeybindsMac: ModalKeybinds = {
    up: ['cmd+k', 'cmd+p'] as string[],
    down: ['cmd+j', 'cmd+n'] as string[],
    delete: ['cmd+d'] as string[],
    select: ['Enter'] as string[],
    cancel: ['Escape'] as string[],
}

// This is not used for now
export const modalPlaceholderMessages : Record<Mode, string> = {
    set: 'Select a mark to set',
    goto: 'Select a mark to go to',
    delete: 'Select a mark to delete',
};

export const defaultSettings: Settings = {
    // hideMarkListDuringInput: false,
    modalListUp: '',
    modalListDown: '',
    modalListSelect: '',
    modalListDelete: '',
    modalListCancel: '',
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
export const modalMarkHarpoonSign = 'harpoon-sign';

export const JSONschemaVersion = 1;

export const modeDescription : Record<Mode, string> = {
    'set': 'Set mark',
    'goto': 'Go to mark',
    'delete': 'Delete mark'
}