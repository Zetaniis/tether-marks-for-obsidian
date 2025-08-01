import { Plugin } from 'obsidian';
import { setGlobalMark, goToGlobalMark, goToHarpoonMark, addFileToHarpoon, deleteGlobalMark } from './commands';
import { SettingsTab } from './ui/SettingsTab';
import { loadSettings, saveSettings, loadMarks, saveMarks, loadLastChangedMark, saveLastChangedMark, JSONschemaCheck } from './utils/storage';
import { Mark, Settings } from 'tether-marks-core';


export default class TetherMarksPlugin extends Plugin {
    settings!: Settings;
    marks: Mark[] = [];
    lastChangedMark: Mark | null = null;

    async onload() {
        await JSONschemaCheck(this);

        this.settings = await loadSettings(this);
        this.marks = await loadMarks(this);
        this.lastChangedMark = await loadLastChangedMark(this);

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

    async saveLastChangedMark(lastChangedMark: Mark) {
        this.lastChangedMark = lastChangedMark;
        await saveLastChangedMark(this, lastChangedMark);
    }

    onunload() {
        console.log('unloading ' + this.manifest.id);
    }
}