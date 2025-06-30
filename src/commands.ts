import VimMarksImpl from './main';
import { MarkListModal } from './ui/MarkListModal';

export async function setGlobalMark(plugin: VimMarksImpl) {
    new MarkListModal(plugin.app, plugin, 'set').open();
}

export async function goToGlobalMark(plugin: VimMarksImpl) {
    new MarkListModal(plugin.app, plugin, 'goto').open();
}

export async function deleteGlobalMark(plugin: VimMarksImpl) {
    new MarkListModal(plugin.app, plugin, 'delete').open();
}


export async function addFileToHarpoon(plugin: VimMarksImpl) {
    new MarkListModal(plugin.app, plugin, 'goto').addFileToHarpoon();
}

export async function goToHarpoonMark(plugin: VimMarksImpl) {
    new MarkListModal(plugin.app, plugin, 'goto', true).open();
}