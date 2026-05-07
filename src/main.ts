import { Plugin } from 'obsidian';
import { setGlobalMark, goToGlobalMark, goToHarpoonMark, addFileToHarpoon, deleteGlobalMark } from './commands';
import { SettingsTab } from './ui/SettingsTab';
import { loadSettings, saveSettings, loadMarks, saveMarks, JSONschemaCheck } from './utils/storage';
import { Mark } from 'tether-marks-core';
import { ObsidianMarksSettings } from './types';


export default class TetherMarksPlugin extends Plugin {
    settings!: ObsidianMarksSettings;
    marks: Mark[] = [];
    history: Mark[][] = [];
    historyIndex = -1;

    async onload() {
        await JSONschemaCheck(this);

        this.settings = await loadSettings(this);
        this.marks = await loadMarks(this);
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

    async updateHistory(marks : Mark[]){
        this.history = this.history.slice(0, this.historyIndex+1);
        this.history.push(marks);
        this.historyIndex = this.history.length-1;
    }

    onunload() {
        console.log('unloading ' + this.manifest.id);
    }
}