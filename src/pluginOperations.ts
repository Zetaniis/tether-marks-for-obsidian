import { Notice } from "obsidian";
import { deleteMark, findFirstUnusedRegister, Mark, removeGapsForHarpoonMarks, setNewOrOverwriteMark } from "tether-marks-core";
import TetherMarksPlugin from "./main";
import { navigateToOpenedFileByPath, openNewFileByPath } from "./utils/obsidianUtils";
import { saveCurrentlySetSnapshot as saveCurrentlySetSnapshotName } from "./utils/storage";

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


export async function pluginSaveMarksToSnapshot(plugin: TetherMarksPlugin, snapshotName: string){
    let snapshots = plugin.snapshots.filter(el => el.name != snapshotName);
    const harpoonRegisters = plugin.settings.harpoonRegisterList.split("");
    let newSnapshot = {
        name: snapshotName, 
        // @ts-ignore
        marks: plugin.marks.filter(el => harpoonRegisters.includes(el.symbol))
    };
    snapshots.push(newSnapshot);
    await plugin.saveSnapshots(snapshots, snapshotName);   
}


export async function pluginLoadMarksFromSnapshot(plugin: TetherMarksPlugin, snapshotName: string) {
    const snapshot = plugin.snapshots.find(el => el.name == snapshotName);
    if (!snapshot) return;

    const harpoonlessMarks = plugin.marks.filter(el => !plugin.settings.harpoonRegisterList.includes(el.symbol));
    const updatedMarks = [...harpoonlessMarks, ...snapshot.marks];

    await plugin.saveMarks(updatedMarks);
    await plugin.updateHistory(updatedMarks);
    await saveCurrentlySetSnapshotName(plugin, snapshotName);
}

export async function pluginDeleteSnapshot(plugin: TetherMarksPlugin, snapshotName: string) {
    const snapshots = plugin.snapshots.filter(el => el.name != snapshotName);
    await plugin.saveSnapshots(snapshots, plugin.loadedSnapshotName);
}