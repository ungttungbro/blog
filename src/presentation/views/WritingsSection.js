'use strict';

import { ELEMENT_TYPE, COMMON } from "../../modules/common/Constants.js";
import { siteMeta } from "../../modules/site/siteMeta.js";
import { SiteLibrary } from "../../modules/common/SiteLibrary.js";
import { Templates } from "../../modules/site/Templates.js";

export class WritingsSection {
    constructor() {
        this.initialize();

        this._BASE_PATH = "/assets/data/blog/writings/";
        this._SECTION_NAME = "writings";
    }

    async initialize(){}

    setOriginalDTO(data) {
        this.original_data = data;
    }

    getOriginalDTO() {
        return this.original_data;
    }

    setCurationDTO(data) {
        this.curation_data = data;
    }

    getCurationDTO() {
        return this.curation_data;
    }

    show() {
        try {
            const el = document.getElementById(this._SECTION_NAME);
            const data = this.getCurationDTO();
            this.createSection(el, data);
        } catch (error) {
            console.log('[ Writings Section ] : ', error);
        }
    }

    createSection(el, data) {        
        const section_meta_data = siteMeta.selectSectionConfig(this._SECTION_NAME);
        if(!section_meta_data) return;

        const section_header = this.generateSectionHeader(section_meta_data);
        Templates.createSectionHeaderEvent(section_header, section_meta_data.captionId);
        el.appendChild(section_header);

        const items = this.generateSectionItems('contents', data, section_meta_data);
        el.appendChild(items);
    }

    createSectionItem(
        id, 
        orientation, 
        meta_data, 
        title, 
        title_char_max_length, 
        summary, 
        summary_char_max_length, 
        content_path
    ) {
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

    generatePostEvent(section_name, id, orientation, element, section_icon, title, header, contents, footer) {
        element.addEventListener('mouseenter', e => { SiteLibrary.prefetch(element, contents); }); 
        element.addEventListener('click', e => {
            e.preventDefault();
            this.presentPost(id, section_name, section_icon, title, orientation, header, contents, footer);
        });
    }

    async presentPost(id, section_name, section_icon, title, orientation, header, contents, footer) {
        const data = await SiteLibrary.loadText(contents);

        Templates.openPost(
            id,
            section_name,                 
            section_icon,
            title,
            orientation, 1, 0.8, 0, 0,
            header, data, footer
        );
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
            Templates.openPost(
                config.listViewerId,
                config.blogTypeName,
                config.sectionHeaderIcon,
                config.sectionListName,
                'portrait', 0, 0, 0.7, 0.8,
                this.generateSectionItems('header', await this.getOriginalDTO(), config),
                null,
                COMMON.COPYRIGHT
            );

            const element = document.getElementById(config.listViewerId);
            element.querySelector('#viewer-maximize-button').style.display = 'none';
        });

        return section_header;
    }
}