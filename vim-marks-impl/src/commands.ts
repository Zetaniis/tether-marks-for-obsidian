import VimMarksImpl from './main';
import { Mark } from './types';
import { MarkListModal } from './ui/MarkListModal';

export async function setGlobalMark(plugin: VimMarksImpl) {
    new MarkListModal(plugin.app, plugin, 'set').open();
}

export async function goToGlobalMark(plugin: VimMarksImpl) {
    new MarkListModal(plugin.app, plugin, 'goto').open();
}