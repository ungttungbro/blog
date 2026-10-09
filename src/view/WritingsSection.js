'use strict';

import { ELEMENT_TYPE, COMMON } from "../modules/common/Constants.js";
import { siteMeta } from "../modules/site/siteMeta.js";
import { SiteLibrary } from "../modules/common/SiteLibrary.js";
import { Templates } from "../modules/site/Templates.js";
import { BaseView } from "./common/BaseView.js";

export class WritingsSection extends BaseView {
    constructor(MainService, BlogService) {
        super();

        this.main_service = MainService;
        this.blog_service = BlogService;
        this.initialize();

        this._BASE_PATH = "/assets/data/blog/writings/";
    }

    async initialize(){}

    show() {
        try {
            this.render();
        } catch (error) {
            console.log('[ Blog Section ] : ', error);
        }
    }

    render() {
        const writings = document.getElementById('writings');
        writings.appendChild(this.createSection('writings', 'blog-writings', this.main_service.writings));
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

    createSectionItem(id, orientation, meta_data, title, title_char_max_length, summary, summary_char_max_length, content_path) {
        const element = document.createElement(ELEMENT_TYPE.DIV);
        element.className = 'writings-section-item-panel';

        const meta_span = document.createElement('span');
        meta_span.className = 'meta';
        meta_span.innerHTML = meta_data;
        meta_span.innerHTML += '<br>';

        element.appendChild(meta_span);

        const title_span = document.createElement('span');
        title_span.className = 'title';
        title_span.textContent = SiteLibrary.truncateText(title, title_char_max_length);

        const summary_span = document.createElement('span');
        summary_span.className = 'summary';
        summary_span.textContent = SiteLibrary.truncateText(summary, summary_char_max_length);

        const a =  document.createElement('a');
        a.href = '#';
        a.appendChild(title_span);
        a.appendChild(document.createElement('br'));
        a.appendChild(summary_span);

        const section_config = siteMeta.selectSectionConfig('writings');
        this.generatePostEvent(
            section_config.blogTypeName, 
            COMMON.VIEWER_PREFIX + id, 
            orientation,
            a, 
            section_config.sectionHeaderIcon, 
            title, 
            null,
            this._BASE_PATH + content_path, 
            COMMON.COPYRIGHT
        );

        element.appendChild(a);

        return element;
    }

    generatePostEvent(section_name, id, orientation, element, section_icon, title, header, content_url, footer) {
        element.addEventListener('mouseenter', e => { SiteLibrary.prefetch(element, content_url); }); 
        element.addEventListener('click', e => {
            e.preventDefault();
            super.openPost(
                id,
                section_name,                 
                section_icon,
                title,
                orientation, 1, 0.8, 0, 0,
                header, content_url, footer
            );
        });
    }

    generateSectionItems(type, data, config) {
        const frag = document.createDocumentFragment();

        const element = document.createElement(ELEMENT_TYPE.DIV);
        element.className = config.postIndexClassName;

        let title_char_max_length = config.listTitleCharLength;
        let summary_char_max_length = config.listSummaryCharLength;

        if (type === 'contents') {
            element.className = config.latestPostClassName;

            title_char_max_length = config.titleCharLength;
            summary_char_max_length = config.summaryCharLength;
        }

        let index = 0;
        for (const [key ,value] of data) {
            const sectionItemElement = this.createSectionItem(
                value.id,
                value.orientation,
                value.type + ' · ' + value.date,
                value.title,
                title_char_max_length,
                value.description,
                summary_char_max_length,
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
            e.preventDefault();
            super.openPost(
                config.listViewerId,
                config.blogTypeName,
                config.sectionHeaderIcon,
                config.sectionListName,
                'portrait', 0, 0, 0.7, 0.8,
                this.generateSectionItems('header', await this.blog_service.buildWritingsList(), config),
                null,
                COMMON.COPYRIGHT
            );

            const element = document.getElementById(config.listViewerId);
            element.querySelector('#viewer-maximize-button').style.display = 'none';
        });

        return section_header;
    }
}