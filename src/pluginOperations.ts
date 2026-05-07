import { Notice } from "obsidian";
import TetherMarksPlugin from "./main";
import { deleteMark, findFirstUnusedRegister, Mark, removeGapsForHarpoonMarks, restoreLastChangedMark, setNewOrOverwriteMark } from "tether-marks-core";
import { navigateToOpenedFileByPath, openNewFileByPath } from "./utils/obsidianUtils";

export async function pluginSetNewOrOverwriteMark(plugin: TetherMarksPlugin, mark: Mark) {
    const file = plugin.app.workspace.getActiveFile();
    if (!file) {
        new Notice('No active file to mark.');
        return;
    }
    const { marks } = setNewOrOverwriteMark(plugin.marks, mark, file.path);
    await plugin.saveMarks(marks);
    await plugin.updateHistory(marks);

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
    let { marks, deletedMark } = deleteMark(plugin.marks, mark);

    if (plugin.settings.harpoonRegisterGapRemoval) {
        const harpoonRegisters = plugin.settings.harpoonRegisterList.split('');
        marks = removeGapsForHarpoonMarks(marks, harpoonRegisters);
    }

    await plugin.saveMarks(marks);
    await plugin.updateHistory(marks);

    new Notice(`Deleted mark '${deletedMark?.symbol}'`);
};

export async function pluginUndoLastChangedMark(plugin: TetherMarksPlugin) {
    if (plugin.historyIndex > 0) {
        plugin.historyIndex--;
        plugin.marks = plugin.history[plugin.historyIndex];
        await plugin.saveMarks(plugin.marks);
    }
}

export async function pluginRedoLastChangedMark(plugin: TetherMarksPlugin) {
    if (plugin.historyIndex >= 0 && plugin.historyIndex < plugin.history.length - 1) {
        plugin.historyIndex++;
        plugin.marks = plugin.history[plugin.historyIndex];
        await plugin.saveMarks(plugin.marks);
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
