import VimMarksImpl from '../main';
import { Settings, Mark } from '../types/index';

export async function loadSettings(plugin: VimMarksImpl): Promise<Settings> {
    return (await plugin.loadData())?.settings || { hideMarkListDuringInput: false };
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