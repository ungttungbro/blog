'use strict';

import { ELEMENT_TYPE, COMMON } from "../modules/common/Constants.js";
import { siteMeta } from "../modules/site/siteMeta.js";
import { SiteLibrary } from "../modules/common/SiteLibrary.js";
import { Templates } from "../modules/site/Templates.js";
import { ViewerStateManager } from "../modules/viewerWindow/ViewerStateManager.js";
import { BaseView } from "./common/BaseView.js";

export class LifelogSection extends BaseView {
    constructor(MainService, BlogService) {
        super();

        this.main_service = MainService;
        this.blog_service = BlogService;
        this.initialize();

        this._BASE_PATH = "/assets/data/blog/lifelog/";
    }

    async initialize() { }

    show() {
        try {
            this.render();
        } catch (error) {
            console.log('[ lifelog Section ] : ', error);
        }
    }

    render() {
        const lifelog = document.getElementById('lifelog');
        lifelog.appendChild(this.createSection('lifelog', 'blog-lifelog', this.main_service.lifelog));
    }

    createSection(type, section_id, data) {        
        const section_meta_data = siteMeta.selectSectionConfig(type);
        if(!section_meta_data) return;

        const element = document.createElement(ELEMENT_TYPE.DIV); element.id = section_id;
        const section_header = this.generateSectionHeader(section_meta_data);

        Templates.createSectionHeaderEvent(section_header, section_meta_data.captionId);

        element.appendChild(section_header);

        const items = this.generateSectionItems('contents', data, section_meta_data);
        element.appendChild(items);

        return element;
    }

    createSectionItem(id, width, meta_data, title, title_char_max_length, content_path) {
        const element = document.createElement(ELEMENT_TYPE.DIV);
        element.className = 'lifelog-section-item-panel';

        const meta_span = document.createElement('span');
        meta_span.className = 'meta';
        meta_span.innerHTML = meta_data;
        meta_span.innerHTML += '<br>';

        element.appendChild(meta_span);

        const title_span = document.createElement('span');
        title_span.className = 'title';
        title_span.textContent = SiteLibrary.truncateText(title, title_char_max_length);

        const a =  document.createElement('a');
        a.href = '#';
        a.appendChild(title_span);
        a.appendChild(document.createElement('br'));

        const section_config = siteMeta.selectSectionConfig('lifelog');

        const footer_span = document.createElement('span');
        footer_span.className = 'footer';
        footer_span.innerHTML = "<p align='right' style='font-size:0.85rem; font-weight:400;'>" 
                                + meta_data 
                                + "</p>";
        footer_span.innerHTML += COMMON.COPYRIGHT;

        this.generatePostEvent(
            section_config.blogTypeName, 
            COMMON.VIEWER_PREFIX + id, 
            width,
            a, 
            section_config.sectionHeaderIcon, 
            title, 
            null,
            this._BASE_PATH + content_path,
            footer_span
        );

        element.appendChild(a);

        return element;
    }

    generatePostEvent(section_name, id, width, element, section_icon, title, header, content_url, footer) {
        element.addEventListener('mouseenter', e => { SiteLibrary.prefetch(element, content_url); });

        element.addEventListener('click', e => {
            e.preventDefault();

            this.openPost(
                id,
                width,
                section_name,
                section_icon,
                title,
                header,
                content_url,
                footer
            );
        });
    }

    generateSectionItems(type, data, config) {
        const frag = document.createDocumentFragment();

        const element = document.createElement(ELEMENT_TYPE.DIV);
        element.className = config.postIndexClassName;

        let title_char_max_length = config.listTitleCharLength;
        if (type === 'contents') {
            element.className = config.latestPostClassName;
            title_char_max_length = config.titleCharLength;
        }

        let index = 0;
        for (const [key, value] of data) {
            const sectionItemElement = this.createSectionItem(
                value.id,
                value.width,
                Templates.symbol(value.type) + value.date + ' (' + value.location + ')',
                value.tags.map(tag => '#' + tag).join(" · "),
                title_char_max_length,
                key + '/' + value.contentUrl
            );

            frag.appendChild(sectionItemElement);

            if (++index < data.size) {
                frag.appendChild(document.createElement('hr'));
            }      
        }

        element.appendChild(frag);

        return element;
    }

    generateSectionHeader(config) {
        const section_header = Templates.createSectionHeader(
            config.sectionHeaderId, 
            config.captionImgId, 
            config.captionId,
            config.className, 
            config.sectionHeaderIcon, 
            config.captionText, 
            config.sectionHeaderIconAlt
        );

        section_header.addEventListener('click',  async e => {
            this.onSectionHeaderClick (
                e, 
                config.blogTypeName, 
                config.listViewerId, 
                config.sectionHeaderIcon, 
                config.sectionListName,
                this.generateSectionItems('header', await this.blog_service.buildLifelogList(), config),
                null,
                COMMON.COPYRIGHT
            );
        });

        return section_header;
    }    

    onSectionHeaderClick(e, blog_type, id, section_icon, title, header, contents, footer) {
        e.preventDefault();

        const config = this.blog_service.buildViewerConfig(id, 27, 35, blog_type, section_icon, title, 18);

        try {
            super.mountContents(
                'blog',
                config, 
                COMMON.TASKBAR_PREFIX + id,
                header, 
                contents, 
                footer
            );
        } catch(error) {
            console.warn('Section Header Event : ', error);
        } finally {
            const element = document.getElementById(id);
            element.dataset.group = config.meta.contentType;

            ViewerStateManager.stateLog(element);
        }
    }
    
    async openPost(id, width, section_name, section_icon, title, header, content_url, footer) {
        const config = this.blog_service.buildViewerConfig(id, width, 35, section_name, section_icon, title, 24);

        try {
            super.mountContents(
                'blog',
                config, 
                COMMON.TASKBAR_PREFIX + id,
                header, 
                await SiteLibrary.loadText(content_url), 
                footer
            );
        } catch(error) {
            console.warn('Blog Post Event : ', error);
        } finally {
            const element = document.getElementById(id);
            element.dataset.group = config.meta.contentType;

            ViewerStateManager.stateLog(element);
        }
    }
}