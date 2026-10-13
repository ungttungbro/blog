import { SiteLibrary } from "../common/SiteLibrary.js";

import { ViewerWindowProcessRegistry } from "../viewerWindow/ViewerWindowProcessRegistry.js";
import { ViewerStateManager } from "../viewerWindow/ViewerStateManager.js";
import { viewerConfig } from "../viewerWindow/viewerConfig.js";
import { ViewerWindow } from "../viewerWindow/ViewerWindow.js";

import { shell } from "../shell/Shell.js";
import { taskbar } from "../taskbar/TaskBar.js";

import { COMMON } from "../common/Constants.js";

export class Templates {
    constructor() {}
    async initialize() {}

    static createSectionHeader(img_id, caption_id, class_name, icon_path, text, icon_alt) {
        const section_header_box = document.createElement('div');
        section_header_box.className = class_name;

        const section_img_caption = SiteLibrary.createImgTitle(
            'medium-icon', 
            img_id,
            caption_id,
            icon_path,
            text, 
            icon_alt
        );

        const more_option = document.createElement('div');
        more_option.className = 'more-options';
        more_option.textContent = '···';

        section_header_box.appendChild(section_img_caption);
        section_header_box.appendChild(more_option);

        return section_header_box;
    }

    static createSectionHeaderEvent(section_header, caption_text) {
        const caption_element = section_header.querySelector(`#${CSS.escape(caption_text)}`);
        const content_text = caption_element.innerHTML;

        section_header.addEventListener('mouseenter', e => {
            caption_element.innerHTML = content_text + '<div class="north-east-arrow">' + '&nbsp;' + ' ↗ ' + '</div>';
        });

        section_header.addEventListener('mouseleave', e => {
            section_header.style.backgroundColor = '';            
            caption_element.innerHTML = content_text;
        });
    }

    static createContentPanel(className, content) {
        const panel = document.createElement('div');
        panel.className = className;
       
        if (typeof content === 'string') {
            panel.innerHTML = content;
        } else if (content instanceof Node) {
            panel.appendChild(content);
        } else {
            if (content !== null) {
                console.warn('Unsupported content type : ', content);
            }
        }

        return panel;
    }

    static setupResponsiveViewer(taskbar_element, viewer_element) {
        if (taskbar_element.taskBarElement.dataset.column < 3) {
            SiteLibrary.toggleElementMaximize(viewer_element.windowElement, 'taskbar');
            if (viewer_element.isMaximized) viewer_element.isMaximized = false;
            else viewer_element.isMaximized = true;

            history.pushState({ list: viewer_element.id }, '', '');
            window.addEventListener('popstate', (e) => {
                if (!e.state) return;
                if (!e.state?.list) {
                    ViewerWindowProcessRegistry.get('unmount', 'function')?.(
                        viewer_element.windowElement.dataset.group,
                        viewer_element.targetId,
                        viewer_element.id
                    );
                }
            });
        }
    }

    static mountViewerContents(type, viewer_config, task_id, header, contents, footer) {
        if (document.getElementById(viewer_config.element.elementId)) {
            ViewerStateManager.bringToFront(document.getElementById(viewer_config.element.elementId));
            return; 
        }

        const viewer = new ViewerWindow();
        viewer.configureWindow(
            viewer_config,
            this.createContentPanel(type + '-header-panel', header),
            this.createContentPanel(type + '-content-panel', contents),
            this.createContentPanel(type + '-footer-panel', footer)
        );

        viewer.targetId = task_id;
        viewer.show();

        this.setupResponsiveViewer(taskbar, viewer);

        shell.mountTaskItem(
            viewer_config.meta.contentType, 
            viewer.targetId, 
            viewer.id, 
            viewer_config.meta.titleIconPath, 
            viewer_config.meta.titleText
        );
    }

    static openPost(
        id, section_name, section_icon, title,
        orientation, landscape_width_weight, landscape_height_weight,portrait_width_weight, portrait_height_height,   
        header, contents, footer
    ) {
         
        const content_size = SiteLibrary.calculateContentSize(
            '#' + section_name,
            orientation, 
            landscape_width_weight,landscape_height_weight, 
            portrait_width_weight, portrait_height_height
        );

        const config = this.buildViewerConfig(
            id, 
            content_size.width, content_size.height, 
            section_name, section_icon, title, 
            (content_size.width * 0.6)
        );

        
        
        try {
            this.mountViewerContents(
                section_name,
                config,
                COMMON.TASKBAR_PREFIX + id,
                header,
                contents,
                footer
            );

            const element = document.getElementById(id);

            if (element) {
                element.dataset.group = config.meta.contentType;
                ViewerStateManager.stateLog(element);
            }
        } catch(error) {
            console.warn('open Post Event : ', error);
        }
    }

    static buildViewerConfig(viewer_id, width, height, content_type, section_icon, title, title_truncate_length) {        
        const config = structuredClone(viewerConfig);    
        
        config.element.elementId = viewer_id;
        config.element.offsetElementId = 'taskbar';
        config.element.className = 'viewer';

        config.layout.width = width + 'rem';
        config.layout.height = height + 'rem';
        config.layout.left = SiteLibrary.pxToRem(((window.innerWidth - SiteLibrary.remToPx(width)) / 2)) + 'rem';
        config.layout.top = SiteLibrary.pxToRem(((window.innerHeight - SiteLibrary.remToPx(height)) / 2)) + 'rem';

        config.meta.contentType = content_type;
        config.meta.titleIconPath = section_icon;
        config.meta.titleText = SiteLibrary.truncateText(title, title_truncate_length);

        return config;
    }
    

    static symbol(type) {
        switch (type) {
            case 'photo' : return '&#128247;&nbsp;';
            case 'video' : return '&#128252;&nbsp;';
            case 'audio' : return '<span style="font-size: 0.7rem;">&#127908&nbsp;</span>';
            case 'text' : return '&#9000;&nbsp;';
            default: return type + ' · ';
        }
    }
}