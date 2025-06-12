import { App, PluginSettingTab, Setting } from 'obsidian';
import VimMarksImpl from '../main';
import { Settings } from '../types/index';

export class SettingsTab extends PluginSettingTab {
    plugin: VimMarksImpl;

    constructor(app: App, plugin: VimMarksImpl) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        this.createRegisterListSetting(containerEl, "Register list", 'abcdefghijklmnopqrstuvwxyz', 'All letters that should be used as registers. Make sure to only input signs that you can input with one click of a keyboard button.', 'registerList')

        new Setting(containerEl)
            .setName('Hide mark list')
            .setDesc('Hide the global mark list for both commands (for fast input, no flicker).')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.hideMarkListDuringInput)
                .onChange(async (value) => {
                    this.plugin.settings.hideMarkListDuringInput = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Open mark in new tab')
            .setDesc('If enabled, opening a mark will open the file in a new tab. If disabled, it will open in the current tab.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.openMarkInNewTab ?? false)
                .onChange(async (value) => {
                    this.plugin.settings.openMarkInNewTab = value;
                    await this.plugin.saveSettings();
                })
            );

        containerEl.createEl('h4', { text: 'Harpoon registers settings' });
        this.createRegisterListSetting(containerEl, "Harpoon register list", 'qwer', 'All letters that should be used as registers for the Harpoon feature. Leftmost letter will be the first register to be used. Make sure to only input signs that you can input with one click of a keyboard button.', 'harpoonRegisterList')

        // Add keyboard shortcut settings
        containerEl.createEl('h4', { text: 'Mark List Navigation Shortcuts' });
        this.createShortcutSetting(containerEl, 'Up', 'ctrl+P', 'Shortcut for moving up in the mark list', 'markListUp');
        this.createShortcutSetting(containerEl, 'Down', 'ctrl+N', 'Shortcut for moving down in the mark list', 'markListDown');
        this.createShortcutSetting(containerEl, 'Select', 'Enter', 'Shortcut for selecting a mark', 'markListSelect');
        this.createShortcutSetting(containerEl, 'Delete', 'ctrl+D', 'Shortcut for deleting a mark', 'markListDelete');
    }

    createShortcutSetting(containerEl: HTMLElement, name: string, defaultValue: string, desc: string, key: keyof Settings) {
        new Setting(containerEl)
            .setName(name)
            .setDesc(desc)
            .addText(text => text
                .setValue((this.plugin.settings as any)[key] || defaultValue)
                .onChange(async (value) => {
                    (this.plugin.settings as any)[key] = value;
                    await this.plugin.saveSettings();
                }));
    }

    createRegisterListSetting(containerEl: HTMLElement, name: string, defaultValue: string, desc: string, key: keyof Settings) {
        new Setting(containerEl)
            .setName(name)
            .setDesc(desc)
            .addText(text => text
                .setValue((this.plugin.settings as any)[key] || defaultValue)
                .onChange(async (value) => {
                    (this.plugin.settings as any)[key] = value;
                    await this.plugin.saveSettings();
                }));
    }
}