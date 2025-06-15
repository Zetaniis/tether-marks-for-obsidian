import { App, TFile, Notice, SuggestModal, MarkdownView, Platform } from 'obsidian';
import VimMarksImpl from '../main';
import { Keybinds, Mark } from '../types/index';

type Mode = 'set' | 'goto' | 'delete';

export class MarkListModal extends SuggestModal<Mark> {
    plugin: VimMarksImpl;
    mode: Mode;
    private _keyHandler?: (evt: KeyboardEvent) => void;
    isMac: boolean;
    isHarpoonMode: boolean;

    constructor(app: App, plugin: VimMarksImpl, mode: Mode, isHarpoonMode: boolean = false) {
        super(app);
        this.plugin = plugin;
        this.mode = mode;
        // this.marks = plugin.marks;
        this.isMac = Platform.isMacOS;
        this.setPlaceholder(this.mode === 'set' ? 'Select a mark to set' : 'Select a mark to go to');
        this.isHarpoonMode = isHarpoonMode; // Default to false, can be set externally
        // If this is a Harpoon mode, set the placeholder accordingly
    }

    getSuggestions(query: string): Mark[] {
        // No search input, always show all marks
        return this.getMarks();
    }

    getMarks(): Mark[] {
        const availableRegisters = new Set((!this.isHarpoonMode ? this.plugin.settings.registerList : this.plugin.settings.harpoonRegisterList).split(''));
        // console.log("harpoon mode:", this.isHarpoonMode);
        // console.log("Harpoon list:", this.plugin.settings.harpoonRegisterList);
        // console.log('Available registers:', availableRegisters);
        return this.plugin.marks.sort((a, b) => a.letter.localeCompare(b.letter)).filter(el => availableRegisters.has(el.letter.toLowerCase()));
    }

    renderSuggestion(mark: Mark, el: HTMLElement) {
        const letterSpan = el.createEl('span', { text: mark.letter, cls: 'mark-letter' });
        const pathSpan = el.createEl('span', { text: mark.filePath, cls: 'mark-file-path' });
        el.addEventListener('click', async (evt) => {
            await this.onChooseSuggestion(mark, evt);
            this.close();
        });
    }

    async setNewMark(mark: Mark){
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

    async onChooseSuggestion(mark: Mark, evt: MouseEvent | KeyboardEvent) {
        if (this.mode === 'set') {
            this.setNewMark(mark);
        } else if (this.mode === 'goto') {
            const file = this.app.vault.getAbstractFileByPath(mark.filePath);
            if (file instanceof TFile) {
                // Check if the file is already open in a leaf
                const leaves = this.app.workspace.getLeavesOfType('markdown');
                for (const leaf of leaves) {
                    const view = leaf.view;
                    if (view instanceof MarkdownView && view.file && view.file.path === mark.filePath) {
                        this.app.workspace.setActiveLeaf(leaf, { focus: true });
                        return;
                    }
                }
                // If not open, open it in the preferred tab
                if (this.plugin.settings.openMarkInNewTab) {
                    this.app.workspace.getLeaf('tab').openFile(file);
                } else {
                    this.app.workspace.getLeaf().openFile(file);
                }
            } else {
                new Notice(`File not found for mark '${mark.letter}'`);
            }
        }
    }

    // Utility to prepare keybinds object
    private prepareKeybinds() {
        let keybinds: Keybinds = {
            up: [] as string[],
            down: [] as string[],
            delete: [] as string[],
        }

        if (this.plugin.settings.markListUp) {
            keybinds.up = [this.plugin.settings.markListUp];
        } else {
            keybinds.up = ['ctrl+k', 'ctrl+p', 'cmd+k', 'cmd+p'];
        }
        if (this.plugin.settings.markListDown) {
            keybinds.down = [this.plugin.settings.markListDown];
        } else {
            keybinds.down = ['ctrl+j', 'ctrl+n', 'cmd+j', 'cmd+n']
        }
        if (this.plugin.settings.markListDelete) {
            keybinds.delete = [this.plugin.settings.markListDelete];
        } else {
            keybinds.delete = ['ctrl+d', 'cmd+d'];
        }

        return keybinds;
    }

    // Override to hide the input box
    onOpen() {
        super.onOpen();
        if (this.inputEl) {
            this.inputEl.style.display = 'none';
        }
        this.modalEl.addClass('vim-marks-modal');

        const keybinds = this.prepareKeybinds();

        // --- Prompt instructions panel ---
        const instructions = this.prepareInstructionPanelElement(keybinds);

        // Insert instructions panel at the bottom of the modal
        this.modalEl.appendChild(instructions);

        this._keyHandler = async (evt: KeyboardEvent) => {
            const availableRegisters = new Set((!this.isHarpoonMode ? this.plugin.settings.registerList  : this.plugin.settings.harpoonRegisterList).split(''));
            if (keybinds.up.some(kb => this.matchKeybind(evt, kb))) {
                evt.preventDefault();
                this.moveSelection(-1);
            } else if (keybinds.down.some(kb => this.matchKeybind(evt, kb))) {
                evt.preventDefault();
                this.moveSelection(1);
            } else if (keybinds.delete.some(kb => this.matchKeybind(evt, kb))) {
                evt.preventDefault();
                // Delete the currently selected mark
                // @ts-ignore
                const chooser = this.chooser;
                const prevIdx = chooser.selectedItem;
                const selected = chooser.values[prevIdx];
                if (selected) {
                    this.plugin.marks = this.plugin.marks.filter(m => m.letter !== selected.letter);
                    await this.plugin.saveMarks(this.plugin.marks);
                    new Notice(`Deleted mark '${selected.letter}'`);
                    // Refresh the modal list
                    chooser.values = this.getMarks();
                    chooser.setSuggestions(chooser.values);
                    // Preserve selection index
                    let newIdx = prevIdx;
                    if (newIdx >= chooser.values.length) {
                        newIdx = chooser.values.length - 1;
                    }
                    chooser.selectedItem = Math.max(0, newIdx);
                    chooser.setSelectedItem(chooser.selectedItem, false);
                }
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
            }
        };
        window.addEventListener('keydown', this._keyHandler, true);
    }

    private prepareInstructionPanelElement(keybinds: Keybinds) {
        const instructions = document.createElement('div');
        instructions.addClass('vim-marks-instructions');
        // Helper to format keybinds for display
        const formatKeys = (keys: string[]) => keys.map(k => `<kbd>${k.replace('cmd', '⌘').replace('ctrl', 'Ctrl').replace('alt', 'Alt').replace('shift', 'Shift')}</kbd>`).join('/');

        instructions.innerHTML = `
            <span>${formatKeys(keybinds.up)} : Up</span>
            <span>${formatKeys(keybinds.down)} : Down</span>
            <span>${formatKeys(keybinds.delete)} : Delete</span>
            <span><kbd>A-Z</kbd> : Jump/Set</span>
            <span><kbd>Enter</kbd> : Confirm</span>
            <span><kbd>Esc</kbd> : Close</span>
        `;
        return instructions;
    }

    onClose() {
        // Remove instructions panel if present
        const instructions = this.modalEl.querySelector('div');
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
        let isSet = false;
        for (const reg of harpoonRegisters) {
            // if register not used already, then use it
            // console.log('Checking register:', reg);
            if (!(this.plugin.marks.map(m => m.letter.toLowerCase()).contains(reg.toLowerCase()))){
                isSet = true;
                this.setNewMark({ letter: reg.toUpperCase(), filePath: this.app.workspace.getActiveFile()?.path || '' });
                break;
            }
        }
        if (!isSet) {
            // If all registers are used, show a notice
            new Notice('Harpoon registers are full, cannot add more marks.');
        }
    }

}