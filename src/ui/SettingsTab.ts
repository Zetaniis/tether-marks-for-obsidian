import { App, PluginSettingTab, Setting } from 'obsidian';
import TetherMarksPlugin from '../main';
import { Settings } from '../types/index';
import { defaultSettings } from '../utils/defaultValues';

export class SettingsTab extends PluginSettingTab {
    plugin: TetherMarksPlugin;

    constructor(app: App, plugin: TetherMarksPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        const ds = defaultSettings;

        new Setting(containerEl)
            .setName('Open mark in new tab')
            .setDesc('Open a file in the new tab when using "go to" command. If disabled, it will open the file in the current tab.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.openMarkInNewTab ?? ds.openMarkInNewTab)
                .onChange(async (value) => {
                    this.plugin.settings.openMarkInNewTab = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('No duplication of opened files when using goto (experimental)')
            .setDesc('Prevents duplicate tabs when switching to already opened files using the mark list after restarting Obsidian. (Experimental: may not work in future Obsidian versions.)')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.experimentalGoto ?? ds.experimentalGoto)
                .onChange(async (value) => {
                    this.plugin.settings.experimentalGoto = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl).setName('General registers').setHeading();
        this.createRegisterListSetting(containerEl, "Register list", ds.registerList, 'Key symbols to be used as registers. Only include symbols that you can input with a single keystroke.', 'registerList')
            .addExtraButton((btn) => {
                btn
                    .setIcon('refresh-ccw')
                    .setTooltip('Reset to default register list')
                    .onClick(async () => {
                        this.plugin.settings.registerList = ds.registerList;
                        await this.plugin.saveSettings();
                        this.display(); // Refresh the settings tab to show the updated value
                    }
                    );
            })

        new Setting(containerEl)
            .setName('Sort all marks by register list')
            .setDesc('Sort marks by the order of the key symbols in the register list. If disabled, marks will be sorted alphabetically according to the current locale.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.registerSortByList ?? ds.registerSortByList)
                .onChange(async (value) => {
                    this.plugin.settings.registerSortByList = value;
                    await this.plugin.saveSettings();
                })
            );

        // TODO: implement this feature
        // new Setting(containerEl)
        //     .setName('Hide mark list')
        //     .setDesc('Hide the global mark list for both commands (for fast input, no flicker).')
        //     .addToggle(toggle => toggle
        //         .setValue(this.plugin.settings.hideMarkListDuringInput ?? ds.hideMarkListDuringInput)
        //         .onChange(async (value) => {
        //             this.plugin.settings.hideMarkListDuringInput = value;
        //             await this.plugin.saveSettings();
        //         }));


        new Setting(containerEl).setName('Harpoon registers').setHeading();
        this.createRegisterListSetting(containerEl, "Harpoon register list", ds.harpoonRegisterList, 'Key symbols to be used as Harpoon registers. Only include symbols that you can input with a single keystroke.', 'harpoonRegisterList')
            .addExtraButton((btn) => {
                btn
                    .setIcon('refresh-ccw')
                    .setTooltip('Reset to default Harpoon register list')
                    .onClick(async () => {
                        this.plugin.settings.harpoonRegisterList = ds.harpoonRegisterList;
                        await this.plugin.saveSettings();
                        this.display(); // Refresh the settings tab to show the updated value
                    }
                    );
            })

        new Setting(containerEl)
            .setName('Sort Harpoon marks by Harpoon register list')
            .setDesc('Sort Harpoon marks by the order of the key symbols in the Harpoon register list. If disabled, marks will be sorted alphabetically according to the current locale.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.harpoonRegisterSortByList ?? ds.harpoonRegisterSortByList)
                .onChange(async (value) => {
                    this.plugin.settings.harpoonRegisterSortByList = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Remove gaps inbetween Harpoon marks')
            .setDesc('Harpoon marks will be shifted to the left for every gap (register with no mark) based on the order of the Harpoon register list.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.harpoonRegisterGapRemoval ?? ds.harpoonRegisterGapRemoval)
                .onChange(async (value) => {
                    this.plugin.settings.harpoonRegisterGapRemoval = value;
                    await this.plugin.saveSettings();
                })
            );


        // Add keyboard shortcut settings
        // TODO: setting those values here like feels wrong, especially passing object property as string
        containerEl.createEl('h4', { text: 'List navigation shortcuts' });
        this.createShortcutSetting(containerEl, 'Up', ds.modalListUp, 'Shortcut for moving up in the list', 'modalListUp');
        this.createShortcutSetting(containerEl, 'Down', ds.modalListDown, 'Shortcut for moving down in the list', 'modalListDown');
        this.createShortcutSetting(containerEl, 'Select', ds.modalListSelect, 'Shortcut for selecting a mark', 'modalListSelect');
        this.createShortcutSetting(containerEl, 'Cancel', ds.modalListCancel, 'Shortcut for cancelling the modal', 'modalListCancel');
        this.createShortcutSetting(containerEl, 'Delete', ds.modalListDelete, 'Shortcut for deleting a mark', 'modalListDelete');
        this.createShortcutSetting(containerEl, 'Restore last changed mark', ds.modalListUndo, 'Shortcut for undoing last action of changing a mark', 'modalListUndo');


    }

    // use only for string values from Settings type
    createShortcutSetting(containerEl: HTMLElement, name: string, defaultValue: string, desc: string, key: keyof Settings) {
        new Setting(containerEl)
            .setName(name)
            .setDesc(desc)
            .addText(text => text
                .setValue(String(this.plugin.settings[key] ?? defaultValue))
                .onChange(async (value) => {
                    (this.plugin.settings as any)[key] = value;
                    await this.plugin.saveSettings();
                }));
    }

    createRegisterListSetting(containerEl: HTMLElement, name: string, defaultValue: string, desc: string, key: keyof Settings): Setting {
        return new Setting(containerEl)
            .setName(name)
            .setDesc(desc)
            .addText(text => text
                .setValue(String(this.plugin.settings[key] ?? defaultValue))
                .onChange(async (value) => {
                    (this.plugin.settings as any)[key] = value;
                    await this.plugin.saveSettings();
                }));
    }
}