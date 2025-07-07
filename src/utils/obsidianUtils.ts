import { App, MarkdownView, Notice, TFile } from "obsidian";
import { Settings } from "../types";

export function openNewFile(filePath: string, openFileInNewTab: boolean, app: App) {
    const file = app.vault.getAbstractFileByPath(filePath);
    if (file instanceof TFile) {
        if (openFileInNewTab) {
            app.workspace.getLeaf('tab').openFile(file);
        } else {
            app.workspace.getLeaf().openFile(file);
        }
    }
    else {
        new Notice(`File not found for path ${filePath}. The file may have been deleted, moved or renamed.`);
    }
}

export function getAllOpenedFilesExperimental(app: App): any {
    // Check if the file is already open in a leaf, wonky but finds all
    // xD
    // @ts-ignore
    return app.workspace.getLayout().main?.children[0].children;

    // const app = this.app;
    // const files = new Set<TFile>();
    // const layout = app.workspace.getLayout();

    // function collectFiles(node: any) {
    //     if (!node) return;
    //     if (node.type === 'leaf' && node.state?.file) {
    //         const file = app.vault.getAbstractFileByPath(node.state.file);
    //         if (file instanceof TFile) files.add(file);
    //     }
    //     if (node.children && Array.isArray(node.children)) {
    //         for (const child of node.children) collectFiles(child);
    //     }
    // }

    // // Traverse all possible roots
    // for (const key of ['main', 'left', 'right', 'center', 'popout']) {
    //     if (layout[key]) collectFiles(layout[key]);
    // }

    // return Array.from(files);
}

export function navigateToOpenFileByPath(filePath: string, experimentalGoto: boolean, app: App): boolean {
    if (experimentalGoto) {
        const openedFiles = getAllOpenedFilesExperimental(app)
        for (const openedFile of openedFiles) {
            if (openedFile.type == 'leaf' && openedFile.state.state.file === filePath) {
                // If the file is already open, switch to it
                const leaf = app.workspace.getLeafById(openedFile.id);
                // console.log('Found leaf for file:', openedFile.state.state.file, openedFile.id, leaf);
                if (leaf) {
                    app.workspace.setActiveLeaf(leaf, { focus: true });
                    return true;
                }
            }
        }
    }
    else {
        // Check if the file is already open in a leaf, misses already opened files that were opened in previous obsidian sessions
        const leaves = app.workspace.getLeavesOfType('markdown');
        for (const leaf of leaves) {
            const view = leaf.view;
            if (view instanceof MarkdownView && view.file && view.file.path === filePath) {
                app.workspace.setActiveLeaf(leaf, { focus: true });
                return true;
            }
        }
    }
    return false;
}