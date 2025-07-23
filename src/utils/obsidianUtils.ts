import { App, normalizePath, Notice, TFile, WorkspaceLeaf } from "obsidian";

export function openNewFileByPath(filePath: string, openFileInNewTab: boolean, app: App) {
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

/**
 * Finds all opened files in the main area through workspace.getLayout(). Not API compliant. Can break anytime. Gets all opened files regardless of state. 
 * */
export function getAllOpenedFilesExperimental(app: App): any {
    // @ts-ignore
    const tabGroups = app.workspace.getLayout().main?.children;
    const out = [];
    for (const el of tabGroups) {
        out.push(...el.children)
    }
    return out;
}

/**
 * Finds all workspace leaves through workspace.iterateAllLeaves. API compliant. Ignores all the non instantiated leaves.
 * */
export function getAllWorkspaceLeaves(app: App): WorkspaceLeaf[] {
    const list: WorkspaceLeaf[] = []
    app.workspace.iterateAllLeaves(leaf => {
        list.push(leaf);
    });

    return list;
}

/**
 * Sets active an opened file that matches the input file path. Respects tab grouping. Returns success bool.  
 * @public
 * */
export function navigateToOpenedFileByPath(filePath: string, experimentalGoto: boolean, app: App): boolean {
    if (experimentalGoto) {
        const openedFiles = getAllOpenedFilesExperimental(app)
        for (const openedFile of openedFiles) {
            if (openedFile.type == 'leaf' && openedFile.state.state.file === filePath) {
                const leaf = app.workspace.getLeafById(openedFile.id);
                if (leaf && leaf.parent === app.workspace.getLeaf().parent) {
                    app.workspace.setActiveLeaf(leaf, { focus: true });
                    return true;
                }
            }
        }
    }
    else {
        const leaves = getAllWorkspaceLeaves(app);
        for (const leaf of leaves) {
            const view = leaf.view;
            // @ts-expect-error
            if (view.file && view.file.path === filePath && leaf.parent === app.workspace.getLeaf().parent) {
                app.workspace.setActiveLeaf(leaf, { focus: true });
                return true;
            }
        }
    }

    return false;
}