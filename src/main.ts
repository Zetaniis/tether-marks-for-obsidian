import { Plugin } from 'obsidian';
import { setGlobalMark, goToGlobalMark, goToHarpoonMark, addFileToHarpoon, deleteGlobalMark } from './commands';
import { MarkListModal } from './ui/MarkListModal';
import { SettingsTab } from './ui/SettingsTab';
import { loadSettings, saveSettings, loadMarks, saveMarks } from './utils/storage';
import { Settings, Mark } from './types/index';

export default class VimMarksImpl extends Plugin {
    settings!: Settings;
    marks: Mark[] = [];

    async onload() {
        this.settings = await loadSettings(this);
        this.marks = await loadMarks(this);

        this.addCommand({
            id: 'set-global-mark',
            name: 'Set Global Mark',
            callback: () => setGlobalMark(this),
        });

        this.addCommand({
            id: 'go-to-global-mark',
            name: 'Go to Global Mark',
            callback: () => goToGlobalMark(this),
        });

        this.addCommand({
            id: 'delete-global-mark',
            name: 'Delete Global Mark',
            callback: () => deleteGlobalMark(this),
        });

        this.addCommand({
            id: 'add-file-to-harpoon',
            name: 'Add File to Harpoon',
            callback: () => addFileToHarpoon(this),
        });

        this.addCommand({
            id: 'go-to-harpoon-mark',
            name: 'Go to Harpoon Mark',
            callback: () => goToHarpoonMark(this),
        });




        this.addSettingTab(new SettingsTab(this.app, this));

        // this.addRibbonIcon('bookmark', 'Show Global Marks', async () => {
        //     const modal = new MarkListModal(this.app, this, 'show');
        //     modal.open();
        // });

        console.log('VimMarksImpl plugin loaded');
    }

    async saveSettings() {
        await saveSettings(this, this.settings);
    }

    async saveMarks(marks: Mark[]) {
        this.marks = marks;
        await saveMarks(this, marks);
    }

    onunload() {
        console.log('VimMarksImpl plugin unloaded');
        // Cleanup if necessary
    }
}