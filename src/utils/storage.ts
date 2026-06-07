import { Notice } from 'obsidian';
import { Mark } from 'tether-marks-core';
import TetherMarksPlugin from '../main';
import { ObsidianMarksSettings, Snapshot } from '../types';
import { defaultObsidianMarksSettings, JSONschemaVersion as latestJSONSchemaVersion } from './defaultValues';

export async function loadSettings(plugin: TetherMarksPlugin): Promise<ObsidianMarksSettings> {
    return (await plugin.loadData())?.settings || defaultObsidianMarksSettings;
}

export async function saveSettings(plugin: TetherMarksPlugin, settings: ObsidianMarksSettings) {
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

export async function loadSnapshots(plugin: TetherMarksPlugin): Promise<Snapshot[]> {
    return (await plugin.loadData())?.snapshots || [];
}

export async function saveSnapshots(plugin: TetherMarksPlugin, snapshots: Snapshot[]) {
    const data = await plugin.loadData() || {};
    data.snapshots = snapshots;
    await plugin.saveData(data);
}

export async function loadCurrentlySetSnapshotName(plugin: TetherMarksPlugin): Promise<string> {
    return (await plugin.loadData())?.loadedSnapshotName || "";
}

export async function  saveCurrentlySetSnapshot(plugin: TetherMarksPlugin, snapshotName : string) {
    const data = await plugin.loadData() || {};
    data.loadedSnapshotName = snapshotName;
    await plugin.saveData(data);
}

export async function JSONschemaCheck(plugin: TetherMarksPlugin) {
    const data = await plugin.loadData();

    if (!data || !data.schemaVersion){
        await plugin.saveData({schemaVersion: latestJSONSchemaVersion, ...data})
        return
    }

    if (data.schemaVersion === latestJSONSchemaVersion){
        return
    }

    new Notice(plugin.manifest.name + ": Faulty data. Check developer tools for more info.");
    console.error(plugin.manifest.id + ": The data loaded is not in correct format. The plugin may not work properly. This usually happens after plugin update that changes the JSON schema. ");
    // TODO: make automatic conversions here if necessary in the future. Be sure to save the legacy pre conversion data as backup in the "legacySchemaData" field. 
}