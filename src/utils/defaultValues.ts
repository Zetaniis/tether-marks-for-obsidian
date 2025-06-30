import { Keybinds } from "../types";

export const defaultKeybinds: Keybinds = {
    up: ['ctrl+k', 'ctrl+p', 'cmd+k', 'cmd+p'] as string[],
    down: ['ctrl+j', 'ctrl+n', 'cmd+j', 'cmd+n'] as string[],
    delete: ['ctrl+d', 'cmd+d'] as string[],
    undo: ['ctrl+u', 'cmd+u'] as string[],
}

export const placeholderMessages = {
    set: 'Select a mark to set',
    goto: 'Select a mark to go to',
    delete: 'Select a mark to delete',
};

export type Mode = 'set' | 'goto' | 'delete';