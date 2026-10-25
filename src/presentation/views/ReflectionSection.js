'use strict';

import { COMMON } from "../../modules/common/Constants.js";
import { siteMeta } from "../../modules/site/siteMeta.js";
import { SiteLibrary } from "../../modules/common/SiteLibrary.js";
import { Templates } from "../../modules/site/Templates.js";

export class ReflectionSection {
    constructor() {
        this.initialize();

        this._BASE_PATH = "/assets/data/blog/reflection/";
        this._SECTION_NAME = "reflection";
    }

    async initialize() { }

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
            console.log('[ Reflection Section ] : ', error);
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

    generateSectionHeader(config) {
        const section_header = Templates.createSectionHeader(
            config.captionImgId, 
            config.captionId,
            config.className, 
            config.sectionHeaderIcon, 
            config.captionText, 
            config.sectionHeaderIconAlt
        );

        this.generateSectionHeaderEvent(section_header, config);

        return section_header;
    }

    generateSectionHeaderEvent(section_header_el, config) {
        section_header_el.addEventListener('click', async e => {
            e.preventDefault();
            this.onSectionHeaderClick(config);
        });
    }

    async onSectionHeaderClick(config) {
        Templates.openPost(
            config.listViewerId,
            config.blogTypeName,
            config.sectionHeaderIcon,
            config.sectionListName,
            'portrait', 0, 0, 1, 1.2,
            this.generateSectionItems('header', await this.getOriginalDTO(), config),
            null,
            COMMON.COPYRIGHT
        );

        /*const element = document.getElementById(config.listViewerId);
        element.querySelector('#viewer-maximize-button').style.display = 'none';*/
    }

    generateSectionItems(type, data, config) {
        const frag = document.createDocumentFragment();

        const element = document.createElement('div');
        element.className = config.postIndexClassName;

        if (type === 'contents') {
            element.className = config.latestPostClassName;
        } else {
            element.className = config.postIndexClassName;
        }

        let index = 0;
        for (const [key ,value] of data) {
            const sectionItemElement = this.createSectionItem(key, value);

            frag.appendChild(sectionItemElement);

            if (++index < data.size) {
                frag.appendChild(document.createElement('hr'));
            }      
        }

        element.appendChild(frag);

        return element;
    }

    createSectionItem(key, value) {
        const element = document.createElement('div');
        element.className = 'teaser-figure';

        const meta = document.createElement('div');
        meta.className = 'meta';
        meta.innerHTML = (value.tags ?? []).map(tag => '#' + tag).join(" · ");
        meta.innerHTML += '<br>';

        element.appendChild(meta);

        const title = document.createElement('div');
        title.className = 'title';
        title.textContent = '「' + value.title + '」' + ' ';

        element.appendChild(title);

        const description = document.createElement('div');
        description.className = 'summary';
        description.textContent = value.description;

        element.appendChild(description);

        const teaser =  document.createElement('a');
        teaser.href = '#';
        teaser.appendChild(element);

        const section_config = siteMeta.selectSectionConfig('reflection');
        this.generatePostEvent(teaser, section_config, key, value);       

        return teaser;
    }

    generatePostEvent(element, config, key, value) {
        element.addEventListener('mouseenter', e => { SiteLibrary.prefetch(element, contents); }); 
        element.addEventListener('click', e => {
            e.preventDefault();
            this.presentPost(config, key, value);
        });
    }

    async presentPost(config, key, value) {
        const data = await SiteLibrary.loadText(this._BASE_PATH + key + '/' + value.contentUrl);

        Templates.openPost(
            value.id,
            config.blogTypeName,                 
            config.sectionHeaderIcon,
            value.title,
            value.orientation, 1.5, 1.25, 0, 0,
            null, 
            data, 
            COMMON.COPYRIGH
        );
    }
}