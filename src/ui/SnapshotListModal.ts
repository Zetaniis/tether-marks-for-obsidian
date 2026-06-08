import { App, FuzzyMatch, FuzzySuggestModal, Instruction, Platform } from 'obsidian';
import TetherMarksPlugin from '../main';
import { pluginDeleteSnapshot, pluginLoadMarksFromSnapshot, pluginSaveMarksToSnapshot } from '../pluginOperations';
import { ModalKeybinds, Snapshot, SnapshotModalMode, snapshotModalModeDescription } from '../types';
import { snapshotModalClass, snapshotModalSnapshotNameClass, snapshotModalTitleNameClass, snapshotModalUnsavedPromptClass } from '../utils/defaultValues';
import { matchKeybind, prepareKeybinds } from '../utils/keybinds';
import { getSortedAndFilteredMarks } from 'tether-marks-core';
import { compareMarkArraysWithOrder } from '../utils/marks';


export class SnapshotListModal extends FuzzySuggestModal<Snapshot> {
    plugin: TetherMarksPlugin;
    mode: SnapshotModalMode;
    private _keyHandler?: (evt: KeyboardEvent) => void;
    snapshotChangedAndUnsavedEl : HTMLDivElement | null;


    getItems(): Snapshot[] {
        return this.plugin.snapshots;
    }

    getItemText(item: Snapshot): string {
        return item.name
    }

    onChooseItem(item: Snapshot, evt: MouseEvent | KeyboardEvent): void {
        if (this.mode === 'save') {
            pluginSaveMarksToSnapshot(this.plugin, item.name);
        } else if (this.mode === 'load') {
            pluginLoadMarksFromSnapshot(this.plugin, item.name);
        } else if (this.mode === 'delete') {
            pluginDeleteSnapshot(this.plugin, item.name);
        }
    }

    constructor(app: App, plugin: TetherMarksPlugin, mode: SnapshotModalMode) {
        super(app);
        this.plugin = plugin;
        this.mode = mode;
        this.setPlaceholder(snapshotModalModeDescription[this.mode]);
        this.snapshotChangedAndUnsavedEl = null;
    }

    getInstructions(modalKeybinds: ModalKeybinds): Instruction[] {
        return [
            { command: modalKeybinds.up.join("/"), purpose: 'Up' },
            { command: modalKeybinds.down.join("/"), purpose: 'Down' },
            { command: modalKeybinds.select.join("/"), purpose: snapshotModalModeDescription[this.mode] },
            ...(this.mode === 'save' ? [{ command: modalKeybinds.altSelect.join("/"), purpose: 'Save to new snapshot' }] : []),
            { command: modalKeybinds.delete.join("/"), purpose: 'Delete' },
            { command: modalKeybinds.cancel.join("/"), purpose: 'Cancel' },
        ];
    }

    renderSuggestion(snapshot: FuzzyMatch<Snapshot>, el: HTMLElement) {
        const snapshotName = el.createEl('span', { text: snapshot?.item?.name, cls: snapshotModalSnapshotNameClass });
    }

    onOpen() {
        super.onOpen();
        this.modalEl.addClass(snapshotModalClass);

        const modalKeybinds = prepareKeybinds(Platform.isMacOS, this.plugin.settings);
        this.setInstructions(this.getInstructions(modalKeybinds));
        this.inputEl.value = (this.mode === 'save') ? String(this.plugin.loadedSnapshotName) : '';

        const currentSnapshotModalTitleEl = document.body.createEl('div', { text: this.plugin.loadedSnapshotName, cls: snapshotModalTitleNameClass });
        const currentSnapshotUnsaved =  this.checkIfCurrentSnapshotIsUnsaved();
        this.snapshotChangedAndUnsavedEl = document.body.createEl('div', { text: "current snapshot is not saved", cls: snapshotModalUnsavedPromptClass });
        this.snapshotChangedAndUnsavedEl.style.display = (currentSnapshotUnsaved) ? 'block' : 'none';
        currentSnapshotModalTitleEl.appendChild(this.snapshotChangedAndUnsavedEl);
        this.titleEl = this.modalEl.insertBefore(currentSnapshotModalTitleEl, this.modalEl.querySelector('.prompt-instructions'));

        this._keyHandler = this.getModalKeyHandler(modalKeybinds);
        window.addEventListener('keydown', this._keyHandler, true);
        this.inputEl.dispatchEvent(new InputEvent("input"));
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
            // @ts-ignore
            const chooser = this.chooser;
            const match = (binds: string[]) => binds.some(kb => matchKeybind(evt, kb));

            if (match(keybinds.up)) {
                this.moveSelection(-1);
            } else if (match(keybinds.down)) {
                this.moveSelection(1);
            } else if (match(keybinds.delete)) {
                await this.handleDeleteKeyPress(chooser);
            } else if (match(keybinds.select)) {
                this.handleSelectKeyPress(chooser, evt);
            } else if (match(keybinds.altSelect)) {
                this.handleAltSelectKeyPress(chooser, evt);
            } else if (match(keybinds.cancel)) {
                this.close();
            }
        };
    }

    async handleDeleteKeyPress(chooser: any) {
        if (!chooser.values) return;
        const prevIdx = chooser.selectedItem;
        const selected: Snapshot = chooser.values[prevIdx].item;
        console.log('selected', selected);
        if (selected) {
            await pluginDeleteSnapshot(this.plugin, selected.name);
            this.refreshList(chooser, prevIdx);
            this.refreshUnchangedPromptEl();
        }
    }

    handleSelectKeyPress(chooser: any, evt: KeyboardEvent) {
        if (chooser.values){
            const selected: Snapshot = chooser.values[chooser.selectedItem];
            if (selected) {
                this.onChooseItem(selected, evt);
                this.close();
            }
        }
    }

    handleAltSelectKeyPress(chooser: any, evt: KeyboardEvent) {
        if (this.mode !== 'save') return;

        const systemLocale = new Intl.DateTimeFormat().resolvedOptions().locale;

        const name = this.inputEl.value == "" ? 
            new Date().toLocaleString(systemLocale, {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', second: '2-digit',
            }) 
            : this.inputEl.value;
        this.onChooseItem( { name: name, marks: [] }, evt);
        this.close();
    }

    checkIfCurrentSnapshotIsUnsaved() : boolean {
        const currentSnapshotFromSnapshots = this.plugin.snapshots.find(el => el.name == this.plugin.loadedSnapshotName)?.marks.sort();
        const currentHarpoonMarks = getSortedAndFilteredMarks(this.plugin.marks, true, this.plugin.settings).sort();
        const currentSnapshotUnsaved = (currentSnapshotFromSnapshots) ? !compareMarkArraysWithOrder(currentSnapshotFromSnapshots, currentHarpoonMarks) : true;
        return currentSnapshotUnsaved;
    }

    refreshList(chooser: any, indexToPreserve: number) {
        chooser.setSuggestions(this.getSuggestions(this.inputEl.value));
        const newIdx = Math.max(0, Math.min(indexToPreserve, this.plugin.snapshots.length - 1));
        chooser.setSelectedItem(newIdx, false);
    }

    refreshUnchangedPromptEl(){
        if (this.snapshotChangedAndUnsavedEl) {
            this.snapshotChangedAndUnsavedEl.style.display = (this.checkIfCurrentSnapshotIsUnsaved()) ? 'block' : 'none';
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