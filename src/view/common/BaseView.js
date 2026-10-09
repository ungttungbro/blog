'use strict';

import { SiteLibrary } from "../../modules/common/SiteLibrary.js";
import { Templates } from "../../modules/site/Templates.js";

import { ViewerWindow } from "../../modules/viewerWindow/ViewerWindow.js";
import { ViewerStateManager } from "../../modules/viewerWindow/ViewerStateManager.js";

import { shell } from "../../modules/shell/Shell.js";
import { taskbar } from "../../modules/taskbar/TaskBar.js";

import { COMMON } from "../../modules/common/Constants.js";

export class BaseView {
    constructor(){}

    mountContents(
        type, 
        viewer_config, 
        task_id, header, 
        contents, 
        footer
    ) {
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

    async openPost(
        id, 
        section_name, 
        section_icon,
        title,
        orientation, 
        landscape_width_weight,
        landscape_height_weight,
        portrait_width_weight,
        portrait_height_height,   
        header, 
        content_url, 
        footer
    ) {
        const content_size = SiteLibrary.calculateContentSize(
            '#' + section_name, 
            orientation, 
            landscape_width_weight, 
            landscape_height_weight,
            portrait_width_weight,
            portrait_height_height
        );

        const config = this.blog_service.buildViewerConfig(
            id, 
            content_size.width, 
            content_size.height, 
            section_name, 
            section_icon, 
            title, 
            (content_size.width * 0.6)
        );

        try {
            this.mountContents(
                'blog',
                config, 
                COMMON.TASKBAR_PREFIX + id,
                header, 
                content_url ? await SiteLibrary.loadText(content_url) : null, 
                footer
            );

            const element = document.getElementById(id);

            if (element) {
                element.dataset.group = config.meta.contentType;
                ViewerStateManager.stateLog(element);
            }
        } catch(error) {
            console.warn('Blog Post Event : ', error);
        }
    }
}