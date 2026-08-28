import { defaultBasicMarksSettings } from "tether-marks-core";
import { ModalKeybinds, ObsidianMarksSettings } from "../types";

export const modalDefaultKeybinds: ModalKeybinds = {
    up: ['ctrl+k'] as string[],
    down: ['ctrl+j'] as string[],
    delete: ['ctrl+d'] as string[],
    select: ['Enter'] as string[],
    altSelect: ['ctrl+Enter'] as string[],
    cancel: ['Escape'] as string[],
    undo: ['ctrl+u'] as string[],
    redo: ['ctrl+r'] as string[],
}

export const modalDefaultKeybindsMac: ModalKeybinds = {
    up: ['cmd+k', 'cmd+p'] as string[],
    down: ['cmd+j', 'cmd+n'] as string[],
    delete: ['cmd+d'] as string[],
    select: ['Enter'] as string[],
    altSelect: ['cmd+Enter'] as string[],
    cancel: ['Escape'] as string[],
    undo: ['cmd+u'] as string[],
    redo: ['cmd+r'] as string[],
}

export const modalInstructionElClass = 'modal-instruction-el';
export const modalMarkSymbolClass = 'mark-symbol';
export const modalMarkFilepathClass = 'mark-file-path';
export const modalMarkHarpoonSign = 'harpoon-sign';

export const JSONschemaVersion = 1;

export const defaultObsidianMarksSettings : ObsidianMarksSettings = {
    ...defaultBasicMarksSettings,
    hidePathInfo: false,
    openMarkInNewTab: false, // If true, open mark in new tab, else in current tab
    experimentalGoto: false,
    passthroughMode: true,
    modalListUp: '',
    modalListDown: '',
    modalListSelect: '',
    modalListAltSelect: '',
    modalListUndo: '',
    modalListRedo: '',
    modalListDelete: '',
    modalListCancel: '',
}


export const snapshotModalSnapshotNameClass = 'snapshot-modal-snapshot-name';
export const snapshotModalTitleNameClass = 'snapshot-modal-title-name';
export const snapshotModalUnsavedPromptClass = 'unsaved-prompt'
export const snapshotModalClass = 'marks-snapshot-modal';