'use strict';

import { ViewerWindow } from "../../modules/viewerWindow/ViewerWindow.js";
import { shell } from "../../modules/shell/Shell.js";
import { Templates } from "../../modules/site/Templates.js";
import { taskbar } from "../../modules/taskbar/TaskBar.js";
import { ViewerStateManager } from "../../modules/viewerWindow/ViewerStateManager.js";

export class BaseView {
    constructor(){}

    mountContents(type, viewer_config, task_id, header, contents, footer) {
        if (document.getElementById(viewer_config.element.elementId)) {
            ViewerStateManager.bringToFront(document.getElementById(viewer_config.element.elementId));
            return; 
        }

        const viewer = new ViewerWindow();
        viewer.configureWindow(
            viewer_config,
            Templates.createContentPanel(type + '-header-panel', header),
            Templates.createContentPanel(type + '-content-panel', contents),
            Templates.createContentPanel(type + '-footer-panel', footer)
        );

        viewer.targetId = task_id;
        viewer.show();

        Templates.setupResponsiveViewer(taskbar, viewer);

        shell.mountTaskItem(
            viewer_config.meta.contentType, 
            viewer.targetId, 
            viewer.id, 
            viewer_config.meta.titleIconPath, 
            viewer_config.meta.titleText
        );
    }
}