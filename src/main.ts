import { Plugin } from 'obsidian';
import { Mark } from 'tether-marks-core';
import { addFileToHarpoon, deleteGlobalMark, goToGlobalMark, goToHarpoonMark, loadMarksFromSnapshot, saveMarksToSnapshot, setGlobalMark } from './commands';
import { ObsidianMarksSettings, Snapshot } from './types';
import { SettingsTab } from './ui/SettingsTab';
import { JSONschemaCheck, loadCurrentlySetSnapshotName, loadMarks, loadSettings, loadSnapshots, saveCurrentlySetSnapshot, saveMarks, saveSettings, saveSnapshots } from './utils/storage';


export default class TetherMarksPlugin extends Plugin {
    settings!: ObsidianMarksSettings;
    marks: Mark[] = [];
    history: Mark[][] = [];
    historyIndex = -1;
    snapshots: Snapshot[] = [];
    loadedSnapshotName: string = "";

    async onload() {
        await JSONschemaCheck(this);

        this.settings = await loadSettings(this);
        this.marks = await loadMarks(this);
        this.snapshots = await loadSnapshots(this);
        this.loadedSnapshotName = await loadCurrentlySetSnapshotName(this);

        if (this.marks.length > 0) {
            this.history.push(this.marks);
            this.historyIndex = this.history.length-1;
        }

        this.addCommand({
            id: 'set-mark',
            name: 'Set mark',
            callback: () => setGlobalMark(this),
        });

        this.addCommand({
            id: 'go-to-mark',
            name: 'Go to mark',
            callback: () => goToGlobalMark(this),
        });

        this.addCommand({
            id: 'delete-mark',
            name: 'Delete mark',
            callback: () => deleteGlobalMark(this),
        });

        this.addCommand({
            id: 'add-file-to-harpoon',
            name: 'Add file to Harpoon',
            callback: () => addFileToHarpoon(this),
        });

        this.addCommand({
            id: 'go-to-harpoon-mark',
            name: 'Go to Harpoon mark',
            callback: () => goToHarpoonMark(this),
        });

        this.addCommand({
            id: 'save-snapshot',
            name: 'Save a snapshot of marks',
            callback: () => saveMarksToSnapshot(this),
        });

        this.addCommand({
            id: 'load-snapshot',
            name: 'Load a snapshot of marks',
            callback: () => loadMarksFromSnapshot(this),
        });


        this.addSettingTab(new SettingsTab(this.app, this));

        console.log('loading ' + this.manifest.id);
    }

    async saveSettings() {
        await saveSettings(this, this.settings);
    }

    async saveMarks(marks: Mark[]) {
        this.marks = marks;
        await saveMarks(this, marks);
    }

    async saveSnapshots(snapshots: Snapshot[], snapshotName: string) {
        this.snapshots = snapshots;
        this.loadedSnapshotName = snapshotName;
        await saveSnapshots(this, snapshots);
        await saveCurrentlySetSnapshot(this, snapshotName);
    }

    async updateHistory(marks : Mark[]){
        this.history = this.history.slice(0, this.historyIndex+1);
        this.history.push(marks);
        this.historyIndex = this.history.length-1;
    }

    onunload() {
        console.log('unloading ' + this.manifest.id);
    }
}