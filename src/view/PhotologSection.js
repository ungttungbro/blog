'use strict';

import { SiteLibrary } from "../modules/common/SiteLibrary.js";
import { taskbar } from "../modules/taskbar/TaskBar.js";
import { ViewerWindow } from "../modules/viewerWindow/ViewerWindow.js";
import { Templates } from "../modules/site/Templates.js";
import { ELEMENT_TYPE, COMMON } from "../modules/common/Constants.js"
import { siteMeta } from "../modules/site/siteMeta.js";
import { ViewerStateManager } from "../modules/viewerWindow/ViewerStateManager.js";
import { ViewerWindowProcessRegistry } from "../modules/viewerWindow/ViewerWindowProcessRegistry.js";

export class PhotologSection {
    constructor(photolog_service) {
        this.photologService = photolog_service;
        this.initialize();
    }

    async initialize() {
        const section_id = this.photologService.serviceName;
        this.photologSectionElement = document.getElementById(section_id);
    }

    show() {
        try {
            this.renderTeasers();
        } catch (error) {
            console.log('error state : ', error);
        }
    }

    renderTeasers() {
        const photolog = this.createSection('photolog', 'photolog-items');
        this.photologSectionElement.appendChild(photolog);
    }

    createSection(type, section_id) {        
        const section_meta_data = siteMeta.selectSectionConfig(type);
        if(!section_meta_data) return;

        const element = document.createElement(ELEMENT_TYPE.DIV); element.id = section_id;
        const section_header = this.generateSectionHeader(siteMeta.selectSectionConfig(type));

        Templates.createSectionHeaderEvent(section_header, section_meta_data.captionId);

        element.appendChild(section_header);

        const subject_list = this.generateTeaserList(5);
        element.appendChild(subject_list);

        return element;
    }

    generateSectionHeader(config) {
        const section_header = Templates.createSectionHeader(
            config.sectionHeaderId, config.captionImgId, config.captionId,
            config.className, config.sectionHeaderIcon, config.text, config.sectionHeaderIconAlt
        );

        section_header.addEventListener('click',  e => {
            this.onSectionHeaderClick (
                e,
                config.photologListViewerId,
                config.sectionHeaderIcon,
                config.photologSectionListName,
                this.generateTeaserList(0),          
                null,                
                COMMON.COPYRIGHT
            );
        });

        return section_header;
    }

    onSectionHeaderClick(e, id, section_icon, title, header, contents, footer) {
        e.preventDefault();

        const contents_id = COMMON.VIEWER_PREFIX + id;
       
        if (document.getElementById(contents_id)) {
            ViewerStateManager.bringToFront(document.getElementById(contents_id));
            return; 
        }

        const height_offset = taskbar.taskBarElement.getBoundingClientRect().bottom;

        const width = window.innerWidth / 4;
        const height = window.innerHeight - height_offset;
        const top = height_offset;
        const left = Math.min(window.innerWidth - width, window.innerWidth); // 화면 안쪽으로 제한

        try {
            const viewer = new ViewerWindow();
            viewer.configureWindow(
                contents_id,
                22 + 'rem',
                38 + 'rem',
                SiteLibrary.pxToRem(((window.innerHeight - SiteLibrary.remToPx('38')) / 2)) + 'rem',
                SiteLibrary.pxToRem(((window.innerWidth - SiteLibrary.remToPx('22')) / 2)) + 'rem',
                'viewer',
                'photolog',
                section_icon,
                title,
                Templates.createContentPanel('photolog-header-panel', header),
                Templates.createContentPanel('photolog-content-panel', contents),                
                Templates.createContentPanel('photolog-footer-panel', footer)
            );

            viewer.targetId = COMMON.TASKBAR_PREFIX + id;
            viewer.show();

            if (taskbar.taskBarElement.dataset.column < 3) {
                SiteLibrary.toggleElementMaximize(viewer.windowElement, 'taskbar');
                if (viewer.isMaximized) viewer.isMaximized = false;
                else viewer.isMaximized = true;

                history.pushState({ list: viewer.id }, '', '');
                window.addEventListener('popstate', (e) => {
                    if (!e.state) return;
                    if (!e.state?.list) {
                        ViewerWindowProcessRegistry.get('unmount', 'function')?.(
                            viewer.windowElement.dataset.group,
                            viewer.targetId,
                            viewer.id
                        );
                    }
                });
            }
            
            taskbar.mount('photolog', viewer.targetId, viewer.id, section_icon, title);
        } catch(error) {
            console.log('Section Header Event : ', error);
        } finally {
            const element = document.getElementById(contents_id);
            element.dataset.group = 'photolog';

            ViewerStateManager.stateLog(element);
        }
    }

    generateTeaserList(row_count) {
        const frag = document.createDocumentFragment();

        const teasers_element = document.createElement(ELEMENT_TYPE.DIV);
        teasers_element.className = siteMeta.photolog.teaserListClassName;

        const iterator = this.photologService.photologData.entries();
        let result = iterator.next();

        let index = 0;
        while (!result.done) {
            const [key, value] = result.value;

            const teaser_figure = this.generateTeaser(
                value.content_id,
                value.thumbnail,
                Object.keys(value.content),
                Object.values(value.content),
                value.photos
            );

            frag.appendChild(teaser_figure);

            const nextResult = iterator.next();
            
            if (row_count > 0) {
                if (!nextResult.done && index < (row_count - 1)) { frag.appendChild(document.createElement('hr')); }
                if (index >= (row_count - 1)) { break; }
            } else {
                if (!nextResult.done) {
                    frag.appendChild(document.createElement('hr'));
                }
            }

            result = nextResult;

            index++;
        }

        teasers_element.appendChild(frag);

        return teasers_element;
    }

    generateTeaser(id, thumbnail_path, title, text, photos_path) {
        const thumbnail = SiteLibrary.createImgElement(
            siteMeta.photolog.thumbnailClassName,
            null,
            thumbnail_path,
            siteMeta.photolog.thumbnailImgAlt
        );

        const teaser = SiteLibrary.createImgTitleCaption(
            thumbnail,
            SiteLibrary.truncateText(title[0], 16),
            SiteLibrary.truncateText(text[0], 70)
        );
        
        teaser.className = siteMeta.photolog.teaserClassName;
        
        this.generateTeaserEvent(teaser, id, title, text.toString(), photos_path, COMMON.COPYRIGHT);
        
        return teaser;
    }

    generateTeaserEvent(element, id, title, header_contents, main_contents, footer_contents) {        
        element.addEventListener('click', e => {
            this.openPhotologContent(
                id,
                title,
                header_contents,
                main_contents,
                footer_contents
            );            
        });
    }

    openPhotologContent(id, title, header_contents, main_contents, footer_contents) {
        const contents_id = COMMON.VIEWER_PREFIX + id;
       
        if (document.getElementById(contents_id)) {
            ViewerStateManager.bringToFront(document.getElementById(contents_id));
            return; 
        }

        //const height_offset = taskbar.taskBarElement.getBoundingClientRect().bottom;

        try {
            const viewer = new ViewerWindow();
            viewer.configureWindow (
                contents_id,
                '44rem'/*(window.innerWidth - ((window.innerWidth / 4) * 1.5)) + 'px'*/,
                '32rem'/*(window.innerHeight - (height_offset * 3)) + 'px'*/,
                SiteLibrary.pxToRem(((window.innerHeight - SiteLibrary.remToPx('32')) / 2)) + 'rem',
                SiteLibrary.pxToRem(((window.innerWidth - SiteLibrary.remToPx('44')) / 2)) + 'rem',
                'viewer',
                'photolog_photo',
                siteMeta.photolog.sectionHeaderIcon,
                title,
                Templates.createContentPanel('photolog-header-panel', header_contents),
                Templates.createContentPanel('photolog-content-panel', this.createPhotoContents(main_contents)),
                Templates.createContentPanel('photolog-footer-panel', footer_contents)
            );

            viewer.targetId = COMMON.TASKBAR_PREFIX + id;
            viewer.show();

            const maximizeButton = viewer.windowElement.querySelector('#viewer-maximize-button');
            if (maximizeButton) {
                maximizeButton.style.display = 'none';
            }

            if (taskbar.taskBarElement.dataset.column < 3) {
                SiteLibrary.toggleElementMaximize(viewer.windowElement, 'taskbar');
                if (viewer.isMaximized) viewer.isMaximized = false;
                else viewer.isMaximized = true;

                history.pushState({ modal: viewer.id }, '', '');
                window.addEventListener('popstate', (e) => {
                    if (!e.state) return;
                    if (!e.state?.modal) {
                        ViewerWindowProcessRegistry.get('unmount', 'function')?.(
                            viewer.windowElement.dataset.group,
                            viewer.targetId,
                            viewer.id
                        );
                    }
                });                
            }

            taskbar.mount('photolog', viewer.targetId, viewer.id, siteMeta.photolog.sectionHeaderIcon, title);            
        } catch (error) {
            console.log('Blog Post Event : ', error);
        } finally {
            const element = document.getElementById(contents_id);
            element.dataset.group = 'photolog';

            ViewerStateManager.stateLog(element);
        }
    }

    createPhotoContents(data) {
        const photo_container = document.createElement(ELEMENT_TYPE.DIV);
        photo_container.className = 'photo-container';

        const frag = document.createDocumentFragment();
               
        for (const content of data) {
            const image = SiteLibrary.createImgElement(
                siteMeta.photolog.photoClassName,
                '',
                content,
                siteMeta.photolog.photoImgAlt
            );

            image.loading = 'lazy';

            frag.appendChild(image);
        }

        photo_container.appendChild(frag);
        
        return photo_container;
    }
}