import { ModalKeybinds} from "../types";

export const modalDefaultKeybinds: ModalKeybinds = {
    up: ['ctrl+k', 'ctrl+p'] as string[],
    down: ['ctrl+j', 'ctrl+n'] as string[],
    delete: ['ctrl+d'] as string[],
    select: ['Enter'] as string[],
    cancel: ['Escape'] as string[],
    undo: ['ctrl+u'] as string[],
}

export const modalDefaultKeybindsMac: ModalKeybinds = {
    up: ['cmd+k', 'cmd+p'] as string[],
    down: ['cmd+j', 'cmd+n'] as string[],
    delete: ['cmd+d'] as string[],
    select: ['Enter'] as string[],
    cancel: ['Escape'] as string[],
    undo: ['cmd+u'] as string[],
}

export const modalInstructionElClass = 'modal-instruction-el';
export const modalMarkSymbolClass = 'mark-symbol';
export const modalMarkFilepathClass = 'mark-file-path';
export const modalMarkHarpoonSign = 'harpoon-sign';

export const JSONschemaVersion = 1;
