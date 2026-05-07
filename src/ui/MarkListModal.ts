import { App, SuggestModal, Platform, Instruction } from 'obsidian';
import TetherMarksPlugin from '../main';
import { modalMarkFilepathClass, modalMarkSymbolClass, modalMarkHarpoonSign } from '../utils/defaultValues';
import { matchKeybind, prepareKeybinds } from '../utils/keybinds';
import { pluginDeleteMark, pluginGoToMark, pluginUndoLastChangedMark as pluginUndoLastChangedMark, pluginSetNewOrOverwriteMark, pluginRedoLastChangedMark } from '../pluginOperations';
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
            { command: modalKeybinds.redo.join("/"), purpose: 'Redo' },

        ];
    }

    getSuggestions(query: string): Mark[] {
        // No search input
        return getSortedAndFilteredMarks(this.plugin.marks, this.isHarpoonMode, this.plugin.settings);
    }

    renderSuggestion(mark: Mark, el: HTMLElement) {
        const symbolEl = el.createEl('span', { text: mark.symbol, cls: modalMarkSymbolClass });
        const itemText = this.plugin.settings.hidePathInfo ?  mark.filePath.split('/').last() : mark.filePath;
        el.createEl('span', { text: itemText, cls: modalMarkFilepathClass });
        if (this.plugin.settings.harpoonRegisterList.contains(mark.symbol)) {
            el.createEl('span', { text: "H", cls: modalMarkHarpoonSign });
        }
        if (this.app.workspace.getActiveFile()?.path === mark.filePath){
            symbolEl.addClass('highlight');
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
            evt.preventDefault();
            const availableRegisters = new Set((!this.isHarpoonMode ? this.plugin.settings.registerList : this.plugin.settings.harpoonRegisterList).split(''));
            // @ts-ignore
            const chooser = this.chooser;
            const match = (binds: string[]) => binds.some(kb => matchKeybind(evt, kb));

            if (match(keybinds.up)) {
                this.moveSelection(-1);
            } else if (match(keybinds.down)) {
                this.moveSelection(1);
            } else if (match(keybinds.delete)) {
                await this.handleDeleteKeyPress(chooser);
            } else if (match(keybinds.undo)) {
                await this.handleHistoryAction(chooser, 'undo');
            } else if (match(keybinds.redo)) {
                await this.handleHistoryAction(chooser, 'redo');
            } else if (match(keybinds.select)) {
                this.handleSelectKeyPress(chooser, evt);
            } else if (match(keybinds.cancel)) {
                this.close();
            } else if (availableRegisters.has(evt.key)) {
                await this.handleRegisterKeyPress(evt.key, evt);
            }
        };
    }

    async handleDeleteKeyPress(chooser: any) {
        if (!chooser.values) return;
        const prevIdx = chooser.selectedItem;
        const selected: Mark = chooser.values[prevIdx];
        if (selected) {
            await pluginDeleteMark(this.plugin, selected);
            this.refreshList(chooser, prevIdx);
        }
    }

    async handleHistoryAction(chooser: any, action: 'undo' | 'redo') {
        if (action === 'undo') await pluginUndoLastChangedMark(this.plugin);
        else await pluginRedoLastChangedMark(this.plugin);
        this.refreshList(chooser, chooser.selectedItem);
    }

    handleSelectKeyPress(chooser: any, evt: KeyboardEvent) {
        const selected: Mark = chooser.values[chooser.selectedItem];
        if (selected) {
            this.onChooseSuggestion(selected, evt);
            this.close();
        }
    }

    async handleRegisterKeyPress(key: string, evt: KeyboardEvent) {
        let mark = getMarkBySymbol(this.plugin.marks, key);
        if (this.mode === 'set' && !mark) {
            mark = { symbol: key, filePath: "" };
        }

        if (mark) {
            await this.onChooseSuggestion(mark, evt);
            this.close();
        }
    }

    refreshList(chooser: any, indexToPreserve: number) {
        const updatedMarks = getSortedAndFilteredMarks(this.plugin.marks, this.isHarpoonMode, this.plugin.settings);
        chooser.values = updatedMarks;
        chooser.setSuggestions(updatedMarks);
        const newIdx = Math.max(0, Math.min(indexToPreserve, updatedMarks.length - 1));
        chooser.setSelectedItem(newIdx, false);
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