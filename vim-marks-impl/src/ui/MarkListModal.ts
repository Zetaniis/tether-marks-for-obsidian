import { App, TFile, Notice, SuggestModal, MarkdownView, Platform } from 'obsidian';
import VimMarksImpl from '../main';
import { Mark } from '../types/index';

type Mode = 'set' | 'goto' | 'show';

export class MarkListModal extends SuggestModal<Mark> {
    plugin: VimMarksImpl;
    mode: Mode;
    marks: Mark[];
    private _keyHandler?: (evt: KeyboardEvent) => void;

    constructor(app: App, plugin: VimMarksImpl, mode: Mode) {
        super(app);
        this.plugin = plugin;
        this.mode = mode;
        this.marks = plugin.marks;
        this.setPlaceholder(this.mode === 'set' ? 'Select a mark to set' : 'Select a mark to go to');
    }

    getSuggestions(query: string): Mark[] {
        // No search input, always show all marks
        return this.marks.sort((a, b) => a.letter.localeCompare(b.letter));
    }

    renderSuggestion(mark: Mark, el: HTMLElement) {
        el.createEl('div', { text: `${mark.letter}: ${mark.filePath}` });
        // Immediate execution on mouse click for A-Z marks
        // if (/^[A-Z]$/i.test(mark.letter)) {
        el.addEventListener('click', async (evt) => {
            await this.onChooseSuggestion(mark, evt);
            this.close();
        });
        // }
    }

    async onChooseSuggestion(mark: Mark, evt: MouseEvent | KeyboardEvent) {
        if (this.mode === 'set') {
            const file = this.app.workspace.getActiveFile();
            if (!file) {
                new Notice('No active file to mark.');
                return;
            }
            const marks = this.plugin.marks.filter((m) => m.letter !== mark.letter);
            marks.push({ letter: mark.letter, filePath: file.path });
            await this.plugin.saveMarks(marks);
            new Notice(`Set mark '${mark.letter}' to ${file.name}`);
        } else if (this.mode === 'goto') {
            const file = this.app.vault.getAbstractFileByPath(mark.filePath);
            if (file instanceof TFile) {
                // Check if the file is already open in a leaf
                const leaves = this.app.workspace.getLeavesOfType('markdown');
                for (const leaf of leaves) {
                    const view = leaf.view;
                    if (view instanceof MarkdownView && view.file && view.file.path === mark.filePath) {
                        this.app.workspace.setActiveLeaf(leaf, true, true);
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

    // Override to hide the input box
    onOpen() {
        super.onOpen();
        if (this.inputEl) {
            this.inputEl.style.display = 'none';
        }

        // Use Obsidian's Platform API for cross-platform detection
        const isMac = Platform.isMacOS;

        // Load custom keybinds from settings, or use defaults
        let upKeybinds: string[];
        let downKeybinds: string[];

        if (this.plugin.settings.markListUp) {
            upKeybinds = [this.plugin.settings.markListUp];
        } else {
            upKeybinds = isMac
                ? ['cmd+k', 'cmd+p', 'ctrl+k', 'ctrl+p']
                : ['ctrl+k', 'ctrl+p', 'cmd+k', 'cmd+p'];
        }
        if (this.plugin.settings.markListDown) {
            downKeybinds = [this.plugin.settings.markListDown];
        }
        else {
            downKeybinds = isMac
                ? ['cmd+j', 'cmd+n', 'ctrl+j', 'ctrl+n']
                : ['ctrl+j', 'ctrl+n', 'cmd+j', 'cmd+n'];
        }

        this._keyHandler = async (evt: KeyboardEvent) => {
            if (upKeybinds.some(kb => this.matchKeybind(evt, kb))) {
                evt.preventDefault();
                this.moveSelection(-1);
            } else if (downKeybinds.some(kb => this.matchKeybind(evt, kb))) {
                evt.preventDefault();
                this.moveSelection(1);
            } else if (/^[a-zA-Z]$/.test(evt.key)) {
                const letter = evt.key.toUpperCase();
                let mark = this.marks.find(m => m.letter.toUpperCase() === letter);
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

    onClose() {
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
        chooser.setSelectedItem(next, true);
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

}