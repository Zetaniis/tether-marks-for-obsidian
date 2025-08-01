import { App, SuggestModal, Platform, Instruction } from 'obsidian';
import TetherMarksPlugin from '../main';
import { modalMarkFilepathClass, modalMarkSymbolClass, modalMarkHarpoonSign } from '../utils/defaultValues';
import { matchKeybind, prepareKeybinds } from '../utils/keybinds';
import { pluginDeleteMark, pluginGoToMark, pluginRestoreLastChangedMark, pluginSetNewOrOverwriteMark } from '../pluginOperations';
import { getMarkBySymbol, getSortedAndFilteredMarks, Mark, Mode, modeDescription } from 'tether-marks-core';
import { ModalKeybinds } from '../types';


export class MarkListModal extends SuggestModal<Mark> {
    plugin: TetherMarksPlugin;
    mode: Mode;
    private _keyHandler?: (evt: KeyboardEvent) => void;
    isHarpoonMode: boolean;

    constructor(app: App, plugin: TetherMarksPlugin, mode: Mode, isHarpoonMode: boolean = false) {
        super(app);
        this.plugin = plugin;
        this.mode = mode;
        // not used, no input field
        // this.setPlaceholder(modalPlaceholderMessages[this.mode]);
        this.isHarpoonMode = isHarpoonMode;
    }

    getInstructions(modalKeybinds: ModalKeybinds): Instruction[] {
        return [
            { command: modalKeybinds.up.join("/"), purpose: 'Up' },
            { command: modalKeybinds.down.join("/"), purpose: 'Down' },
            { command: '[Symbol]', purpose: modeDescription[this.mode] },
            { command: modalKeybinds.select.join("/"), purpose: modeDescription[this.mode] },
            { command: modalKeybinds.delete.join("/"), purpose: 'Delete' },
            { command: modalKeybinds.cancel.join("/"), purpose: 'Cancel' },
            { command: modalKeybinds.undo.join("/"), purpose: 'Undo' },

        ];
    }

    getSuggestions(query: string): Mark[] {
        // No search input
        return getSortedAndFilteredMarks(this.plugin.marks, this.isHarpoonMode, this.plugin.settings);
    }

    renderSuggestion(mark: Mark, el: HTMLElement) {
        el.createEl('span', { text: mark.symbol, cls: modalMarkSymbolClass });
        el.createEl('span', { text: mark.filePath, cls: modalMarkFilepathClass });
        if (this.plugin.settings.harpoonRegisterList.contains(mark.symbol)) {
            el.createEl('span', { text: "H", cls: modalMarkHarpoonSign });
        }
        el.addEventListener('click', async (evt) => {
            await this.onChooseSuggestion(mark, evt);
            this.close();
        });
    }

    onOpen() {
        super.onOpen();
        // Hide the input box, as it's not needed
        if (this.inputEl) {
            this.inputEl.style.display = 'none';
        }
        this.modalEl.addClass('marks-modal');

        const modalKeybinds = prepareKeybinds(Platform.isMacOS, this.plugin.settings);
        this.setInstructions(this.getInstructions(modalKeybinds));

        this._keyHandler = this.getModalKeyHandler(modalKeybinds);
        window.addEventListener('keydown', this._keyHandler, true);
    }

    onClose() {
        if (this._keyHandler) {
            window.removeEventListener('keydown', this._keyHandler, true);
            this._keyHandler = undefined;
        }
        super.onClose();
    }

    getModalKeyHandler(keybinds: ModalKeybinds) {
        return async (evt: KeyboardEvent) => {
            const availableRegisters = new Set((!this.isHarpoonMode ? this.plugin.settings.registerList : this.plugin.settings.harpoonRegisterList).split(''));
            // @ts-ignore
            const chooser = this.chooser;
            if (keybinds.up.some(kb => matchKeybind(evt, kb))) {
                evt.preventDefault();
                this.moveSelection(-1);
            } else if (keybinds.down.some(kb => matchKeybind(evt, kb))) {
                evt.preventDefault();
                this.moveSelection(1);
            } else if (keybinds.delete.some(kb => matchKeybind(evt, kb))) {
                evt.preventDefault();
                if (chooser.values) {
                    // Delete the currently selected mark
                    const prevIdx = chooser.selectedItem;
                    const selected: Mark = chooser.values[prevIdx];
                    if (selected) {
                        await pluginDeleteMark(this.plugin, selected);
                        // Refresh the modal list
                        chooser.values = getSortedAndFilteredMarks(this.plugin.marks, this.isHarpoonMode, this.plugin.settings);
                        chooser.setSuggestions(chooser.values);
                        // Preserve selection index
                        chooser.setSelectedItem(Math.max(0, Math.min(prevIdx, chooser.values.length)), false);
                    }
                }
            }
            else if (keybinds.undo.some(kb => matchKeybind(evt, kb))) {
                evt.preventDefault();
                // Restore the last changed mark
                await pluginRestoreLastChangedMark(this.plugin);
                // Refresh the modal list
                chooser.values = getSortedAndFilteredMarks(this.plugin.marks, this.isHarpoonMode, this.plugin.settings);
                const prevIdx = chooser.selectedItem;
                chooser.setSuggestions(chooser.values);
                chooser.setSelectedItem(Math.max(0, prevIdx), false);
            } else if (keybinds.select.some(kb => matchKeybind(evt, kb))) {
                evt.preventDefault();
                // Delete the currently selected mark
                const ind = chooser.selectedItem;
                const selected: Mark = chooser.values[ind];
                if (selected) {
                    this.onChooseSuggestion(selected, evt);
                    this.close();
                }
            } else if (keybinds.cancel.some(kb => matchKeybind(evt, kb))) {
                evt.preventDefault();
                this.close();
            } else if (availableRegisters.has(evt.key)) {
                let mark = getMarkBySymbol(this.plugin.marks, evt.key);
                if (this.mode === 'set') {
                    if (mark == null) {
                        mark = { symbol: evt.key, filePath: "" };
                    }
                    evt.preventDefault();
                    await this.onChooseSuggestion(mark, evt);
                    this.close();
                } else if (this.mode === 'goto' && mark) {
                    evt.preventDefault();
                    await this.onChooseSuggestion(mark, evt);
                    this.close();
                }
                else if (this.mode === 'delete' && mark) {
                    evt.preventDefault();
                    await this.onChooseSuggestion(mark, evt);
                    // Refresh the modal list
                    this.close();
                }
            }
        };
    }

    async onChooseSuggestion(mark: Mark, evt: MouseEvent | KeyboardEvent) {
        if (this.mode === 'set') {
            pluginSetNewOrOverwriteMark(this.plugin, mark);
        } else if (this.mode === 'goto') {
            pluginGoToMark(this.plugin, mark);
        } else if (this.mode === 'delete') {
            pluginDeleteMark(this.plugin, mark);
        }
    }

    moveSelection(delta: number) {
        // Move the selection up or down by delta
        // this.chooser is SuggestModal's internal chooser
        // @ts-ignore
        const chooser = this.chooser;
        if (!chooser) return;
        // @ts-ignore
        let idx = chooser.selectedItem;
        if (typeof idx !== 'number') idx = 0;
        if (!chooser.values) return;
        const max = chooser.values.length;
        let next = idx + delta;
        if (next < 0) next = max - 1;
        if (next >= max) next = 0;
        // @ts-ignore
        chooser.setSelectedItem(next, 0 as KeyboardEvent);
    }

}