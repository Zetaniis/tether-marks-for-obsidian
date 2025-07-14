import { Plugin } from 'obsidian';
import { setGlobalMark, goToGlobalMark, goToHarpoonMark, addFileToHarpoon, deleteGlobalMark } from './commands';
import { SettingsTab } from './ui/SettingsTab';
import { loadSettings, saveSettings, loadMarks, saveMarks, JSONschemaCheck } from './utils/storage';
import { Settings, Mark } from './types/index';

export default class VimMarksImpl extends Plugin {
    settings!: Settings;
    marks: Mark[] = [];

    async onload() {
        await JSONschemaCheck(this);

        this.settings = await loadSettings(this);
        this.marks = await loadMarks(this);

        this.addCommand({
            id: 'set-global-mark',
            name: 'Set mark',
            callback: () => setGlobalMark(this),
        });

        this.addCommand({
            id: 'go-to-global-mark',
            name: 'Go to mark',
            callback: () => goToGlobalMark(this),
        });

        this.addCommand({
            id: 'delete-global-mark',
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

        console.log('loading tether-marks');
    }

    async saveSettings() {
        await saveSettings(this, this.settings);
    }

    async saveMarks(marks: Mark[]) {
        this.marks = marks;
        await saveMarks(this, marks);
    }

    onunload() {
        // Potential cleanup
        console.log('unloading tether-marks');
    }
}