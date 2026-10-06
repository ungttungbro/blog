'use strict';

import { ELEMENT_TYPE } from "../../modules/common/Constants.js";
import { ViewerWindow } from "../../modules/viewerWindow/ViewerWindow.js";
import { shell } from "../../modules/shell/Shell.js";
import { Templates } from "../../modules/site/Templates.js";
import { siteMeta } from "../../modules/site/siteMeta.js";
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

    createSection(type, section_id, data) {        
        const section_meta_data = siteMeta.selectSectionConfig(type);
        if(!section_meta_data) return;

        const element = document.createElement(ELEMENT_TYPE.DIV); element.id = section_id;
        const section_header = this.generateSectionHeader(section_meta_data);

        Templates.createSectionHeaderEvent(section_header, section_meta_data.captionId);

        element.appendChild(section_header);

        const items = this.generateSectionItems('contents',data, section_meta_data);
        element.appendChild(items);

        return element;
    }
}