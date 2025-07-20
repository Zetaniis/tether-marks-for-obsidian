import { modalDefaultKeybinds, modalDefaultKeybindsMac } from "./defaultValues";
import { ModalKeybinds } from "../types";
import { Settings } from "../types";

// Utility to prepare keybinds object
export function prepareKeybinds(isMacOS: boolean, settings: Settings) {
    let keybinds: ModalKeybinds = (!isMacOS) ? { ...modalDefaultKeybinds } : { ...modalDefaultKeybindsMac };

    if (settings.modalListUp) {
        keybinds.up = [settings.modalListUp];
    }

    if (settings.modalListDown) {
        keybinds.down = [settings.modalListDown];
    }

    if (settings.modalListDelete) {
        keybinds.delete = [settings.modalListDelete];
    }

    if (settings.modalListSelect){
        keybinds.select = [settings.modalListSelect];
    }

    if (settings.modalListCancel){
        keybinds.cancel = [settings.modalListCancel];
    }
 
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