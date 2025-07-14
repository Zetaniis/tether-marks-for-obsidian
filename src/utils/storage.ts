import VimMarksImpl from '../main';
import { Settings, Mark } from '../types/index';
import { defaultSettings, JSONschemaVersion as latestJSONSchemaVersion } from './defaultValues';

export async function loadSettings(plugin: VimMarksImpl): Promise<Settings> {
    return (await plugin.loadData())?.settings || defaultSettings;
}

export async function saveSettings(plugin: VimMarksImpl, settings: Settings) {
    const data = await plugin.loadData() || {};
    data.settings = settings;
    await plugin.saveData(data);
}

export async function loadMarks(plugin: VimMarksImpl): Promise<Mark[]> {
    return (await plugin.loadData())?.marks || [];
}

export async function saveMarks(plugin: VimMarksImpl, marks: Mark[]) {
    const data = await plugin.loadData() || {};
    data.marks = marks;
    await plugin.saveData(data);
}

export async function loadLastChangedMark(plugin: VimMarksImpl): Promise<Mark> {
    return (await plugin.loadData())?.lastChangedMark || [];
}

export async function saveLastChangedMark(plugin: VimMarksImpl, lastChangedMark: Mark) {
    const data = await plugin.loadData() || {};
    data.lastChangedMark = lastChangedMark;
    await plugin.saveData(data);
}

export async function JSONschemaCheck(plugin: VimMarksImpl) {
    const data = await plugin.loadData() || {schemaVersion: latestJSONSchemaVersion};

    if (data.schemaVersion && data.schemaVersion === latestJSONSchemaVersion){
        return
    }

    console.log("tether-marks: The data loaded is not in correct format. The plugin may not work correctly. This will usually happen after plugin update that changes JSON schema. ");
    // TODO: make automatic conversions here if necessary in the future. Be sure to save the legacy pre conversion data as backup in the "legacySchemaData" field. 
}