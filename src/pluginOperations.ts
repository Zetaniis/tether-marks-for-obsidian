import { Notice } from "obsidian";
import TetherMarksPlugin from "./main";
import { Mark } from "./types";
import { deleteMark, findFirstUnusedRegister, removeGapsForHarpoonMarks, restoreLastChangedMark, setNewOrOverwriteMark } from "./utils/marks";
import { navigateToOpenedFileByPath, openNewFileByPath } from "./utils/obsidianUtils";

export async function pluginSetNewOrOverwriteMark(plugin: TetherMarksPlugin, mark: Mark) {
    const file = plugin.app.workspace.getActiveFile();
    if (!file) {
        new Notice('No active file to mark.');
        return;
    }
    const { marks, overwrittenMark } = setNewOrOverwriteMark(plugin.marks, mark, file.path);
    await plugin.saveMarks(marks);
    if (overwrittenMark) {
        await plugin.saveLastChangedMark(overwrittenMark);
    }
    new Notice(`Set mark '${mark.symbol}' to ${file.name}`);
}

export function pluginGoToMark(plugin: TetherMarksPlugin, mark: Mark) {
    const success = navigateToOpenedFileByPath(mark.filePath, plugin.settings.experimentalGoto, plugin.app);
    // If file not open, then open it in the preferred tab
    if (!success) {
        openNewFileByPath(mark.filePath, plugin.settings.openMarkInNewTab, plugin.app);
    }
}

export async function pluginDeleteMark(plugin: TetherMarksPlugin, mark: Mark) {
    const { marks, deletedMark } = deleteMark(plugin.marks, mark);
    await plugin.saveMarks(marks);

    if (deletedMark) {
        await plugin.saveLastChangedMark(deletedMark);
    }

    if (plugin.settings.harpoonRegisterGapRemoval) {
        pluginRemoveGapsForHarpoonMarks(plugin);
    }

    new Notice(`Deleted mark '${deletedMark?.symbol}'`);
};

export async function pluginRestoreLastChangedMark(plugin: TetherMarksPlugin) {
    // Undo the last changed mark
    if (plugin.lastChangedMark) {
        const out = restoreLastChangedMark(plugin.marks, plugin.lastChangedMark)
        await plugin.saveMarks(out.marks);
        new Notice(`Restored mark '${plugin.lastChangedMark.symbol}' to ${plugin.lastChangedMark.filePath}`);
        if (out.markToDiscard) {
            plugin.saveLastChangedMark(out.markToDiscard);
        }
    } else {
        new Notice('No last changed mark to restore.');
    }
}

export function pluginAddFileToHarpoon(plugin: TetherMarksPlugin) {
    // Add the selected mark to the Harpoon list
    const harpoonRegisters = plugin.settings.harpoonRegisterList.split('');
    const reg = findFirstUnusedRegister(plugin.marks, harpoonRegisters);

    if (reg) {
        const file = plugin.app.workspace.getActiveFile();
        if (!file) {
            new Notice('No active file to mark.');
            return;
        }
        pluginSetNewOrOverwriteMark(plugin, { symbol: reg, filePath: file.path });
    }
    else {
        // If all registers are used, show a notice
        new Notice('Harpoon registers are full, cannot add more marks.');
    }
}

export async function pluginRemoveGapsForHarpoonMarks(plugin: TetherMarksPlugin) {
    const harpoonRegisters = plugin.settings.harpoonRegisterList.split('');
    const marks = removeGapsForHarpoonMarks(plugin.marks, harpoonRegisters);
    await plugin.saveMarks(marks);
}
