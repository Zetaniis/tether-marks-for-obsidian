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

        new Setting(containerEl)
            .setName('Hide mark list')
            .setDesc('Hide the global mark list for both commands (for fast input, no flicker).')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.hideMarkListDuringInput)
                .onChange(async (value) => {
                    this.plugin.settings.hideMarkListDuringInput = value;
                    await this.plugin.saveSettings();
                }));

        // Add keyboard shortcut settings
        containerEl.createEl('h4', { text: 'Mark List Navigation Shortcuts' });
        this.createShortcutSetting(containerEl, 'Up', 'ctrl+P', 'Shortcut for moving up in the mark list', 'markListUp');
        this.createShortcutSetting(containerEl, 'Down', 'ctrl+N', 'Shortcut for moving down in the mark list', 'markListDown');
        this.createShortcutSetting(containerEl, 'Select', 'Enter', 'Shortcut for selecting a mark', 'markListSelect');
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
}