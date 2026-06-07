import { ModalKeybinds, ObsidianMarksSettings } from "../types";
import { modalDefaultKeybinds, modalDefaultKeybindsMac } from "./defaultValues";

// Utility to prepare keybinds object
export function prepareKeybinds(isMacOS: boolean, settings: ObsidianMarksSettings) {
    const keybinds: ModalKeybinds = isMacOS ? { ...modalDefaultKeybindsMac } : { ...modalDefaultKeybinds };

    const mapping: Record<keyof ModalKeybinds, keyof ObsidianMarksSettings> = {
        up: 'modalListUp',
        down: 'modalListDown',
        delete: 'modalListDelete',
        select: 'modalListSelect',
        altSelect: 'modalListAltSelect',
        undo: 'modalListUndo',
        redo: 'modalListRedo',
        cancel: 'modalListCancel',
    };

    // @ts-ignore
    (Object.entries(mapping) as [keyof ModalKeybinds, keyof ObsidianMarksSettings][]).forEach(([targetKey, settingsKey]) => {
        const userValue = settings[settingsKey];
        if (userValue && typeof userValue === 'string' && userValue.trim() !== '') {
            keybinds[targetKey] = [userValue];
        }
    });

    return keybinds;
}


export function matchKeybind(evt: KeyboardEvent, keybind: string): boolean {
    // Parse keybind string like 'ctrl+shift+p', 'cmd+n', etc.
    const parts = keybind.split('+').map(p => p.trim());
    let required = { ctrl: false, shift: false, alt: false, meta: false, key: '' };
    for (const part of parts) {
        if (part === 'ctrl') required.ctrl = true;
        else if (part === 'shift') required.shift = true;
        else if (part === 'alt') required.alt = true;
        else if (part === 'meta' || part === 'cmd' || part === 'win') required.meta = true;
        else required.key = part;
    }
    // Check modifiers
    if (evt.ctrlKey !== required.ctrl) return false;
    if (evt.shiftKey !== required.shift) return false;
    if (evt.altKey !== required.alt) return false;
    if (evt.metaKey !== required.meta) return false;
    // Check key (case-insensitive)
    return evt.key === required.key;
}