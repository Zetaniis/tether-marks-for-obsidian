import TetherMarksPlugin from './main';
import { pluginAddFileToHarpoon } from './pluginOperations';
import { MarkListModal } from './ui/MarkListModal';

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