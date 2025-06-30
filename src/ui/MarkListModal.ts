import { App, TFile, Notice, SuggestModal, MarkdownView, Platform, WorkspaceLeaf } from 'obsidian';
import VimMarksImpl from '../main';
import { Keybinds, Mark } from '../types/index';
import { defaultKeybinds, defaultKeybindsMac, modalInstructionElClass, modalMarkFilepathClass, modalMarkLetterClass, Mode, placeholderMessages } from '../utils/defaultValues';
import { findFirstUnusedRegister, getSortedAndFilteredMarks, sortMarksAlphabetically } from '../utils/marks';


export class MarkListModal extends SuggestModal<Mark> {
    plugin: VimMarksImpl;
    mode: Mode;
    private _keyHandler?: (evt: KeyboardEvent) => void;
    isHarpoonMode: boolean;

    constructor(app: App, plugin: VimMarksImpl, mode: Mode, isHarpoonMode: boolean = false) {
        super(app);
        this.plugin = plugin;
        this.mode = mode;
        // this.marks = plugin.marks;
        this.setPlaceholder(placeholderMessages[this.mode]);
        // this.setInstructions([{command: 'vim-marks:mark-list', purpose: "asdf"}]);
        this.isHarpoonMode = isHarpoonMode; // Default to false, can be set externally
    }

    getSuggestions(query: string): Mark[] {
        // No search input, always show all marks
        return this.getMarks();
    }

    getMarks(): Mark[] {
        return getSortedAndFilteredMarks(this.plugin.marks, this.isHarpoonMode, this.plugin.settings);
    }

    renderSuggestion(mark: Mark, el: HTMLElement) {
        el.createEl('span', { text: mark.letter, cls: modalMarkLetterClass });
        el.createEl('span', { text: mark.filePath, cls: modalMarkFilepathClass });
        el.addEventListener('click', async (evt) => {
            await this.onChooseSuggestion(mark, evt);
            this.close();
        });
    }


    getAllOpenedFilesExperimental(): any {
        // xD
        // @ts-ignore
        return this.app.workspace.getLayout().main?.children[0].children

        // const app = this.app;
        // const files = new Set<TFile>();
        // const layout = app.workspace.getLayout();

        // function collectFiles(node: any) {
        //     if (!node) return;
        //     if (node.type === 'leaf' && node.state?.file) {
        //         const file = app.vault.getAbstractFileByPath(node.state.file);
        //         if (file instanceof TFile) files.add(file);
        //     }
        //     if (node.children && Array.isArray(node.children)) {
        //         for (const child of node.children) collectFiles(child);
        //     }
        // }

        // // Traverse all possible roots
        // for (const key of ['main', 'left', 'right', 'center', 'popout']) {
        //     if (layout[key]) collectFiles(layout[key]);
        // }

        // return Array.from(files);
    }

    // Utility to prepare keybinds object
    private prepareKeybinds() {
        let keybinds: Keybinds = (!Platform.isMacOS) ? { ...defaultKeybinds } : { ...defaultKeybindsMac };

        if (this.plugin.settings.markListUp) {
            keybinds.up = [this.plugin.settings.markListUp];
        }

        if (this.plugin.settings.markListDown) {
            keybinds.down = [this.plugin.settings.markListDown];
        }

        if (this.plugin.settings.markListDelete) {
            keybinds.delete = [this.plugin.settings.markListDelete];
        }

        if (this.plugin.settings.markChangeUndo) {
            keybinds.undo = [this.plugin.settings.markChangeUndo];
        }

        return keybinds;
    }

    // Override to hide the input box
    onOpen() {
        super.onOpen();
        if (this.inputEl) {
            this.inputEl.style.display = 'none';
        }
        this.modalEl.addClass('marks-modal');

        const keybinds = this.prepareKeybinds();

        // --- Prompt instructions panel ---
        const instructions = this.prepareModalInstructionElement(keybinds);

        // Insert instructions panel at the bottom of the modal
        this.modalEl.appendChild(instructions);

        this._keyHandler = this.getModalKeyHandler(keybinds);
        window.addEventListener('keydown', this._keyHandler, true);
    }

    getModalKeyHandler(keybinds: Keybinds) {
        return async (evt: KeyboardEvent) => {
            const availableRegisters = new Set((!this.isHarpoonMode ? this.plugin.settings.registerList : this.plugin.settings.harpoonRegisterList).split(''));
            // @ts-ignore
            const chooser = this.chooser;
            if (keybinds.up.some(kb => this.matchKeybind(evt, kb))) {
                evt.preventDefault();
                this.moveSelection(-1);
            } else if (keybinds.down.some(kb => this.matchKeybind(evt, kb))) {
                evt.preventDefault();
                this.moveSelection(1);
            } else if (keybinds.delete.some(kb => this.matchKeybind(evt, kb))) {
                evt.preventDefault();
                // Delete the currently selected mark
                const prevIdx = chooser.selectedItem;
                const selected: Mark = chooser.values[prevIdx];
                if (selected) {
                    await this.deleteMark(selected);
                    // Refresh the modal list
                    chooser.values = this.getMarks();
                    chooser.setSuggestions(chooser.values);
                    // Preserve selection index
                    let newIdx = prevIdx;
                    if (newIdx >= chooser.values.length) {
                        newIdx = chooser.values.length - 1;
                    }
                    chooser.setSelectedItem(Math.max(0, newIdx), false);
                }
                // else if (keybinds.undo.some(kb => this.matchKeybind(evt, kb))) {
                // }
            }
            else if (keybinds.undo.some(kb => this.matchKeybind(evt, kb))) {
                evt.preventDefault();
                // Restore the last changed mark
                await this.restoreLastChangedMark();
                // Refresh the modal list
                chooser.values = this.getMarks();
                chooser.setSuggestions(chooser.values);
            } else if (availableRegisters.has(evt.key)) {
                const letter = evt.key.toUpperCase();
                let mark = this.plugin.marks.find(m => m.letter.toUpperCase() === letter);
                if (this.mode === 'set') {
                    if (!mark) {
                        // Create a new mark for this letter
                        const file = this.app.workspace.getActiveFile();
                        if (!file) {
                            new Notice('No active file to mark.');
                            return;
                        }
                        mark = { letter, filePath: file.path };
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

    async setNewOrOverwriteMark(mark: Mark) {
        const file = this.app.workspace.getActiveFile();
        if (!file) {
            new Notice('No active file to mark.');
            return;
        }
        const marks = this.plugin.marks.filter((m) => m.letter !== mark.letter);
        marks.push({ letter: mark.letter, filePath: file.path });
        await this.plugin.saveMarks(marks);
        new Notice(`Set mark '${mark.letter}' to ${file.name}`);
    }

    goToMark(mark: Mark) {
        const file = this.app.vault.getAbstractFileByPath(mark.filePath);
        if (file instanceof TFile) {
            if (this.plugin.settings.experimentalGoto) {
                const openedFiles = this.getAllOpenedFilesExperimental()
                // console.log('Opened files:', openedFiles);
                for (const openedFile of openedFiles) {
                    if (openedFile.type == 'leaf' && openedFile.state.state.file === mark.filePath) {
                        // If the file is already open, switch to it
                        const leaf = this.app.workspace.getLeafById(openedFile.id);
                        // console.log('Found leaf for file:', openedFile.state.state.file, openedFile.id, leaf);
                        if (leaf) {
                            this.app.workspace.setActiveLeaf(leaf, { focus: true });
                            return;
                        }
                    }
                }
            }
            else {
                // Check if the file is already open in a leaf
                const leaves = this.app.workspace.getLeavesOfType('markdown');
                // Check if the file is already open in a leaf // const leaves = this.app.workspace.getLeavesOfType('markdown');
                for (const leaf of leaves) {
                    const view = leaf.view;
                    if (view instanceof MarkdownView && view.file && view.file.path === mark.filePath) {
                        this.app.workspace.setActiveLeaf(leaf, { focus: true });
                        return;
                    }
                }
            }
            // If not open, open it in the preferred tab
            if (this.plugin.settings.openMarkInNewTab) {
                this.app.workspace.getLeaf('tab').openFile(file);
            } else {
                this.app.workspace.getLeaf().openFile(file);
            }
        }
        else {
            new Notice(`File not found for mark '${mark.letter}. The file may have been deleted, moved or renamed.`);
        }
    }


    private async deleteMark(mark: Mark) {
        const cMark = { ...mark };
        this.plugin.marks = this.plugin.marks.filter(m => m.letter !== cMark.letter);

        if (this.plugin.settings.harpoonRegisterGapRemoval) {
            this.removeGapsForHarpoonMarks();
        }

        await this.plugin.saveMarks(this.plugin.marks);
        new Notice(`Deleted mark '${cMark.letter}'`);
    };

    removeGapsForHarpoonMarks() {
        new Notice("Not implemented");
        // removing gaps in harpoon marks - not working for now
        //     const harpoonRegisters = this.plugin.settings.harpoonRegisterList.split('');
        //     // Find the index of the deleted mark's letter
        //     // let index = harpoonRegisters.indexOf(letter.toLowerCase());
        //     // if (index !== -1) {
        //     let leftCur = 0;
        //     let rightCur = 1;

        //     while (rightCur < harpoonRegisters.length) {
        //         console.log(leftCur, rightCur, harpoonRegisters.length);
        //         // const currentMarkInd = this.plugin.marks.findIndex(el => el.letter === harpoonRegisters[index].toLowerCase());
        //         const nextMarkInd = this.plugin.marks.findIndex(el => el.letter.toLowerCase() === harpoonRegisters[rightCur].toLowerCase());

        //         if (!(nextMarkInd === -1)) {
        //             const updatedMark: Mark = { letter: harpoonRegisters[leftCur], filePath: this.plugin.marks[nextMarkInd].filePath };
        //             const marks = this.plugin.marks.filter((m) => m.letter !== updatedMark.letter || m.letter !== this.plugin.marks[nextMarkInd].letter);
        //             marks.push(updatedMark);
        //             console.log('Updated marks:', marks);
        //             this.plugin.marks = marks;
        //             leftCur++;
        //         }
        //         rightCur++;
        //         // }
        // }

    }

    async restoreLastChangedMark() {
        // Undo the last changed mark
        if (this.plugin.lastChangedMark) {
            const markToRestore = { ...this.plugin.lastChangedMark };
            const markToDiscard = this.plugin.marks.find(m => m.letter === markToRestore.letter);
            const marksWithoutDiscarded = this.plugin.marks.filter(m => m.letter !== markToRestore.letter);

            if (markToDiscard) {
                this.plugin.saveLastChangedMark(markToDiscard);
            }

            marksWithoutDiscarded.push({ letter: markToRestore.letter, filePath: markToRestore.filePath });
            await this.plugin.saveMarks(marksWithoutDiscarded);
            // await this.setNewOrOverwriteMark(lastMark);
            new Notice(`Restored mark '${markToRestore.letter}' to ${markToRestore.filePath}`);
        } else {
            new Notice('No last changed mark to restore.');
        }
    }

    private prepareModalInstructionElement(keybinds: Keybinds) {
        const instructions = document.createElement('div');
        instructions.addClass(modalInstructionElClass);
        // Helper to format keybinds for display
        const formatKeys = (keys: string[]) => keys.map(k => `<kbd>${k.replace('cmd', '⌘').replace('ctrl', 'Ctrl').replace('alt', 'Alt').replace('shift', 'Shift')}</kbd>`).join('/');

        instructions.innerHTML = `
            <span>${formatKeys(keybinds.up)} : Up</span>
            <span>${formatKeys(keybinds.down)} : Down</span>
            <span>${formatKeys(keybinds.delete)} : Delete</span>
            <span>${formatKeys(keybinds.undo)} : Undo last changed mark</span>
            <span><kbd>Symbol</kbd> : Jump/Set/Delete</span>
            <span><kbd>Enter</kbd> : Confirm</span>
            <span><kbd>Esc</kbd> : Close</span>

        `;
        return instructions;
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

    matchKeybind(evt: KeyboardEvent, keybind: string): boolean {
        // Parse keybind string like 'ctrl+shift+p', 'cmd+n', etc.
        const parts = keybind.split('+').map(p => p.trim().toLowerCase());
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
        return evt.key.toLowerCase() === required.key;
    }

    addFileToHarpoon() {
        // Add the selected mark to the Harpoon list
        const harpoonRegisters = this.plugin.settings.harpoonRegisterList.split('');
        const reg = findFirstUnusedRegister(this.plugin.marks, harpoonRegisters);

        if (!reg) {
            // If all registers are used, show a notice
            new Notice('Harpoon registers are full, cannot add more marks.');
        }
        else {
            this.setNewOrOverwriteMark({ letter: reg.toUpperCase(), filePath: this.app.workspace.getActiveFile()?.path || '' });
        }
    }

}