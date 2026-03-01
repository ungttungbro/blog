'use strict';

import { ELEMENT_TYPE, COMMON, VIEWER } from "../modules/common/Constants.js";
import { siteMeta } from "../modules/site/siteMeta.js";
import { SiteLibrary } from "../modules/common/SiteLibrary.js";
import { ViewerWindow } from "../modules/viewerWindow/ViewerWindow.js";
import { shell } from "../modules/shell/Shell.js";
import { Templates } from "../modules/site/Templates.js";
import { taskbar } from "../modules/taskbar/TaskBar.js";
import { ViewerStateManager } from "../modules/viewerWindow/ViewerStateManager.js";
import { ViewerWindowProcessRegistry } from "../modules/viewerWindow/ViewerWindowProcessRegistry.js";

export class BlogSection {
    constructor(blog_service) {
        this.blogService = blog_service;
        this.initialize();
    }

    async initialize() { }

    show() {
        try {
            this.renderBlog();
        } catch (error) {
            console.log('[ Blog Section ] : ', error);
        }
    }
    
    renderBlog() {
        const writings = document.getElementById('writings');
        writings.appendChild(this.createSection('writings', 'blog-writings', this.blogService.blogMetaData));

        const lifelog_and_archive = document.getElementById('lifelog-and-archive');
        lifelog_and_archive.appendChild(this.createSection('lifelog', 'blog-lifelog', this.blogService.lifelogMetaData));
        lifelog_and_archive.appendChild(this.createSection('archive', 'blog-archive', this.blogService.archiveMetaData));

        const reflection = document.getElementById('reflection');
        reflection.appendChild(this.createSection('reflection', 'blog-reflection', this.blogService.reflectionMetaData));
    }

    createSection(type, section_id, data) {        
        const section_meta_data = siteMeta.selectSectionConfig(type);
        if(!section_meta_data) return;

        const element = document.createElement(ELEMENT_TYPE.DIV); element.id = section_id;
        const section_header = this.generateSectionHeader(data, siteMeta.selectSectionConfig(type));

        Templates.createSectionHeaderEvent(section_header, section_meta_data.captionId);

        element.appendChild(section_header);

        const subject_list = this.generateSubjectList('latest-post', data, siteMeta.selectSectionConfig(type));
        element.appendChild(subject_list);

        return element;
    }

    generateSectionHeader(data, config) {
        const section_header = Templates.createSectionHeader(
            config.sectionHeaderId, config.captionImgId, config.captionId,
            config.className, config.sectionHeaderIcon, config.captionText, config.sectionHeaderIconAlt
        );

        section_header.addEventListener('click',  e => {
            this.onSectionHeaderClick (
                e, config.blogTypeName, config.listViewerId, config.sectionHeaderIcon, config.sectionListName,
                this.generateSubjectList('post-index', data, config),
                null,
                COMMON.COPYRIGHT
            );
        });

        return section_header;
    }

    showViewer() {
        
    }

    onSectionHeaderClick(e, blog_type, id, section_icon, title, header, contents, footer) {
        e.preventDefault();

        const contents_id = COMMON.VIEWER_PREFIX + id;
       
        if (document.getElementById(contents_id)) {
            ViewerStateManager.bringToFront(document.getElementById(contents_id));
            return; 
        }

        const width = window.innerWidth * VIEWER.LIST_RATIO_MIDDLE;        
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
                'blog',
                section_icon,
                title,
                Templates.createContentPanel('blog-header-panel', header),
                contents,
                Templates.createContentPanel('blog-footer-panel', footer)
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
            
            shell.mountTaskItem(blog_type, viewer.targetId, viewer.id, section_icon, title);
        } catch(error) {
            console.warn('Section Header Event : ', error);
        } finally {
            const element = document.getElementById(contents_id);
            element.dataset.group = blog_type;

            ViewerStateManager.stateLog(element);
        }
    }

    generateSubjectList(ux_type, data, config) {
        const frag = document.createDocumentFragment();

        const subject_list = document.createElement(ELEMENT_TYPE.DIV);
        subject_list.className = config.postIndexClassName;

        let row_count = 0;
        let titleCharLength = config.listTitleCharLength;
        let summaryCharLength = config.listSummaryCharLength;

        if (ux_type === 'latest-post') {
            subject_list.className = config.latestPostClassName;

            titleCharLength = config.titleCharLength;
            summaryCharLength = config.summaryCharLength;
            row_count = config.subjectListRowCount;
        }

        const iterator = data.entries();
        let result = iterator.next();

        let index = 0;
        while (!result.done) {
            const [key, value] = result.value;

            let region = '';
            if (config.blogTypeName === 'lifelog') { region = ' (' + value.region + ')'; }

            const meta_span = document.createElement('span');
            meta_span.className = 'meta';
            meta_span.innerHTML = Templates.symbol(value.type) /*+ value.type + ' · '*/ + key + region;
            meta_span.innerHTML += '<br>';
            frag.appendChild(meta_span);

            const title = document.createElement('span');
            title.className = 'title';
            title.textContent = SiteLibrary.truncateText(value.title, titleCharLength);

            const summary = document.createElement('span');
            summary.className = 'summary';
            summary.textContent = SiteLibrary.truncateText(value.summary, summaryCharLength);

            const a =  document.createElement('a');
            a.href = '#';
            a.appendChild(title);
            a.appendChild(document.createElement('br'));
            a.appendChild(summary);
                        
            this.generatePostEvent(
                config.blogTypeName, data, a, key, config.sectionHeaderIcon, value.title, 
                null, value.content_path,COMMON.COPYRIGHT
            );      

            frag.appendChild(a);

            const nextResult = iterator.next();
            if (row_count > 0) {
                if (!nextResult.done && index < (row_count - 1)) {
                    frag.appendChild(document.createElement('hr')); 
                }

                if (index >= (row_count - 1)) { break; }
            } else {
                if (!nextResult.done) {
                    frag.appendChild(document.createElement('hr'));
                }
            }

            result = nextResult;

            index++;
        }

        subject_list.appendChild(frag);

        return subject_list;
    }

    generatePostEvent(type, data, element, id, section_icon, title, header, content_path, footer) {
        element.addEventListener('mouseenter', e => { this.prefetchPost(element, content_path); }); 
        element.addEventListener('click',  e => {
            let viewer_width = '44rem';
            if (type === 'lifelog') { viewer_width = data.get(id)['width']; }

            this.onPostClick (
                e, data.get(id)['content_id'], type, viewer_width, section_icon,
                title, header,content_path, footer
            );
        });
    }
    
    prefetchPost(element, content_path) {
        if (element.dataset.prefetched) return;

        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = content_path;
        link.as = 'document';

        document.head.appendChild(link);
        element.dataset.prefetched = 'true';
    }

    async onPostClick(e, id, blog_type, viewer_width, section_icon, title, header, content_path, footer) {
        e.preventDefault();

        const contents_id = COMMON.VIEWER_PREFIX + id;
       
        if (document.getElementById(contents_id)) {
            ViewerStateManager.bringToFront(document.getElementById(contents_id));
            return; 
        }

        let left = (window.innerWidth * VIEWER.LIST_RATIO_MIDDLE);
        if (blog_type === 'lifelog') {
            left = (window.innerWidth 
                - ((window.innerWidth * VIEWER.LIST_RATIO_MIDDLE) 
                + (SiteLibrary.remToPx(viewer_width))
            ));
        }

        try {
            const viewer = new ViewerWindow();
            viewer.configureWindow(
                contents_id,
                viewer_width,
                '36rem',
                SiteLibrary.pxToRem(((window.innerHeight - SiteLibrary.remToPx('36')) / 2)) + 'rem',
                SiteLibrary.pxToRem(((window.innerWidth - SiteLibrary.remToPx('44')) / 2)) + 'rem',
                'viewer',
                'blog',
                section_icon,
                SiteLibrary.truncateText(title, 24),
                header,
                Templates.createContentPanel(
                    'blog-content-panel', 
                    await this.blogService.loadContentData(content_path)
                ),
                Templates.createContentPanel('blog-footer-panel', footer)
            );

            viewer.targetId = COMMON.TASKBAR_PREFIX + id;
            viewer.show();
            
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

            shell.mountTaskItem(blog_type, viewer.targetId, viewer.id, section_icon, title);
        } catch(error) {
            console.warn('Blog Post Event : ', error);
        } finally {
            const element = document.getElementById(contents_id);
            element.dataset.group = blog_type;

            ViewerStateManager.stateLog(element);
        }
    }
}