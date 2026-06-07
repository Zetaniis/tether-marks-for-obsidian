import TetherMarksPlugin from './main';
import { pluginAddFileToHarpoon } from './pluginOperations';
import { MarkListModal } from './ui/MarkListModal';
import { SnapshotListModal } from './ui/SnapshotListModal';

export async function setGlobalMark(plugin: TetherMarksPlugin) {
    new MarkListModal(plugin.app, plugin, 'set').open();
}

export async function goToGlobalMark(plugin: TetherMarksPlugin) {
    new MarkListModal(plugin.app, plugin, 'goto').open();
}

export async function deleteGlobalMark(plugin: TetherMarksPlugin) {
    new MarkListModal(plugin.app, plugin, 'delete').open();
}


export async function addFileToHarpoon(plugin: TetherMarksPlugin) {
    pluginAddFileToHarpoon(plugin);
}

export async function goToHarpoonMark(plugin: TetherMarksPlugin) {
    new MarkListModal(plugin.app, plugin, 'goto', true).open();
}


export async function saveMarksToSnapshot(plugin: TetherMarksPlugin) {
    new SnapshotListModal(plugin.app, plugin, 'save').open();
}

export async function loadMarksFromSnapshot(plugin: TetherMarksPlugin) {
    // TODO: prompt for quick save if the saved snapshot with the name of current snapshot is different
    new SnapshotListModal(plugin.app, plugin, 'load').open();
}