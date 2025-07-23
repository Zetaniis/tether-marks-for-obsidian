import { App, Notice, SuggestModal, Platform, Instruction } from 'obsidian';
import TetherMarksPlugin from '../main';
import { ModalKeybinds, Mark } from '../types/index';
import { Mode } from "../types";
import { modalInstructionElClass, modalMarkFilepathClass, modalMarkSymbolClass, modalPlaceholderMessages, modalMarkHarpoonSign, modeDescription } from '../utils/defaultValues';
import { deleteMark, findFirstUnusedRegister, getMarkBySymbol, getSortedAndFilteredMarks, removeGapsForHarpoonMarks, restoreLastChangedMark, setNewOrOverwriteMark } from '../utils/marks';
import { matchKeybind, prepareKeybinds } from '../utils/keybinds';
import { navigateToOpenedFileByPath, openNewFile as openNewFileByPath } from '../utils/obsidianUtils';


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
        // Remove instructions panel if present
        const instructions = this.modalEl.querySelector("." + modalInstructionElClass);
        if (instructions) instructions.remove();

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
                // Delete the currently selected mark
                const prevIdx = chooser.selectedItem;
                const selected: Mark = chooser.values[prevIdx];
                if (selected) {
                    await this.deleteMark(selected);
                    // Refresh the modal list
                    chooser.values = getSortedAndFilteredMarks(this.plugin.marks, this.isHarpoonMode, this.plugin.settings);
                    chooser.setSuggestions(chooser.values);
                    // Preserve selection index
                    let newIdx = prevIdx;
                    if (newIdx >= chooser.values.length) {
                        newIdx = chooser.values.length - 1;
                    }
                    chooser.setSelectedItem(Math.max(0, newIdx), false);
                }
            }
            else if (keybinds.undo.some(kb => matchKeybind(evt, kb))) {
                console.error("Undo feature is bugged for now.");
                evt.preventDefault();
                // Restore the last changed mark
                await this.restoreLastChangedMark();
                // Refresh the modal list
                chooser.values = getSortedAndFilteredMarks(this.plugin.marks, this.isHarpoonMode, this.plugin.settings);
                chooser.setSuggestions(chooser.values);
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
            this.setNewOrOverwriteMark(mark);
        } else if (this.mode === 'goto') {
            this.goToMark(mark);
        } else if (this.mode === 'delete') {
            this.deleteMark(mark);
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
        const max = chooser.values.length;
        let next = idx + delta;
        if (next < 0) next = max - 1;
        if (next >= max) next = 0;
        // @ts-ignore
        chooser.setSelectedItem(next, 0 as KeyboardEvent);
    }

    async setNewOrOverwriteMark(mark: Mark) {
        const file = this.app.workspace.getActiveFile();
        if (!file) {
            new Notice('No active file to mark.');
            return;
        }
        const { marks, overwrittenMark } = setNewOrOverwriteMark(this.plugin.marks, mark, file.path);
        await this.plugin.saveMarks(marks);
        new Notice(`Set mark '${mark.symbol}' to ${file.name}`);
    }

    goToMark(mark: Mark) {
        const success = navigateToOpenedFileByPath(mark.filePath, this.plugin.settings.experimentalGoto, this.app);
        // If file not open, then open it in the preferred tab
        if (!success) {
            openNewFileByPath(mark.filePath, this.plugin.settings.openMarkInNewTab, this.app);
        }
    }

    private async deleteMark(mark: Mark) {
        const { marks, deletedMark } = deleteMark(this.plugin.marks, mark);
        await this.plugin.saveMarks(marks);

        if (this.plugin.settings.harpoonRegisterGapRemoval) {
            this.removeGapsForHarpoonMarks();
        }

        new Notice(`Deleted mark '${deletedMark?.symbol}'`);
    };

    async restoreLastChangedMark() {
        // Undo the last changed mark
        // buggy
        if (this.plugin.lastChangedMark) {
            const out = restoreLastChangedMark(this.plugin.marks, this.plugin.lastChangedMark)
            await this.plugin.saveMarks(out.marks);
            if (out.markToDiscard) {
                new Notice(`Restored mark '${this.plugin.lastChangedMark.symbol}' to ${this.plugin.lastChangedMark.filePath}`);
                this.plugin.saveLastChangedMark(out.markToDiscard);
            }
        } else {
            new Notice('No last changed mark to restore.');
        }
    }

    addFileToHarpoon() {
        // Add the selected mark to the Harpoon list
        const harpoonRegisters = this.plugin.settings.harpoonRegisterList.split('');
        const reg = findFirstUnusedRegister(this.plugin.marks, harpoonRegisters);

        if (reg) {
            const file = this.app.workspace.getActiveFile();
            if (!file) {
                new Notice('No active file to mark.');
                return;
            }
            this.setNewOrOverwriteMark({ symbol: reg, filePath: file.path });
        }
        else {
            // If all registers are used, show a notice
            new Notice('Harpoon registers are full, cannot add more marks.');
        }
    }

    async removeGapsForHarpoonMarks() {
        const harpoonRegisters = this.plugin.settings.harpoonRegisterList.split('');
        const marks = removeGapsForHarpoonMarks(this.plugin.marks, harpoonRegisters);
        await this.plugin.saveMarks(marks);
    }

}