import { Notice } from 'obsidian';
import TetherMarksPlugin from '../main';
import { JSONschemaVersion as latestJSONSchemaVersion } from './defaultValues';
import { defaultSettings, Mark, Settings } from 'tether-marks-core';

export async function loadSettings(plugin: TetherMarksPlugin): Promise<Settings> {
    return (await plugin.loadData())?.settings || defaultSettings;
}

export async function saveSettings(plugin: TetherMarksPlugin, settings: Settings) {
    const data = await plugin.loadData() || {};
    data.settings = settings;
    await plugin.saveData(data);
}

export async function loadMarks(plugin: TetherMarksPlugin): Promise<Mark[]> {
    return (await plugin.loadData())?.marks || [];
}

export async function saveMarks(plugin: TetherMarksPlugin, marks: Mark[]) {
    const data = await plugin.loadData() || {};
    data.marks = marks;
    await plugin.saveData(data);
}

export async function loadLastChangedMark(plugin: TetherMarksPlugin): Promise<Mark> {
    return (await plugin.loadData())?.lastChangedMark || {};
}

export async function saveLastChangedMark(plugin: TetherMarksPlugin, lastChangedMark: Mark) {
    const data = await plugin.loadData() || {};
    data.lastChangedMark = lastChangedMark;
    await plugin.saveData(data);
}

export async function JSONschemaCheck(plugin: TetherMarksPlugin) {
    const data = await plugin.loadData() || {schemaVersion: latestJSONSchemaVersion};

    if (data.schemaVersion && data.schemaVersion === latestJSONSchemaVersion){
        return
    }

    new Notice(plugin.manifest.name + ": Faulty data. Check developer tools for more info.");
    console.error(plugin.manifest.id + ": The data loaded is not in correct format. The plugin may not work properly. This usually happens after plugin update that changes the JSON schema. ");
    // TODO: make automatic conversions here if necessary in the future. Be sure to save the legacy pre conversion data as backup in the "legacySchemaData" field. 
}