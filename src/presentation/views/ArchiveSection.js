'use strict';

import { ELEMENT_TYPE, COMMON } from "../../modules/common/Constants.js";
import { siteMeta } from "../../modules/site/siteMeta.js";
import { SiteLibrary } from "../../modules/common/SiteLibrary.js";
import { Templates } from "../../modules/site/Templates.js";

export class ArchiveSection {
    constructor() {
        this.initialize();

        this._BASE_PATH = "/assets/data/blog/archive/";
        this._SECTION_NAME = "archive";
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
            console.log('[ Archive Section ] : ', error);
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
        section_header_el.addEventListener('click', e => {            
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
            'portrait', 0, 0, 0.8, 1.15,
            this.generateSectionItems('header', await this.getOriginalDTO(), config),
            null,
            COMMON.COPYRIGHT
        );

        const element = document.getElementById(config.listViewerId);
        element.querySelector('#viewer-maximize-button').style.display = 'none';
    }

    generateSectionItems(type, data, config) {
        const frag = document.createDocumentFragment();

        const element = document.createElement('div');

        if (type === 'contents') {
            element.className = config.latestPostClassName;
        } else {
            element.className = config.postIndexClassName;
        }

        let index = 0;
        for (const [key, value] of data) {
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

        /*const meta_el = document.createElement('div');
        meta_el.className = 'meta';
        meta_el.innerHTML = Templates.symbol(value.type) + value.tags.map(tag => '#' + tag).join(" · ");
        meta_el.innerHTML += '<br>';

        element.appendChild(meta_el);*/

        const title_el = document.createElement('div');
        title_el.className = 'title';
        title_el.textContent = value.title;

        element.appendChild(title_el);

        const teaser =  document.createElement('a');
        teaser.href = '#';
        teaser.appendChild(element);

        const section_config = siteMeta.selectSectionConfig('archive');
        this.generatePostEvent(
            section_config.blogTypeName,
            COMMON.VIEWER_PREFIX + value.id,
            value.orientation,
            teaser, 
            section_config.sectionHeaderIcon, 
            value.title, 
            null,
            this._BASE_PATH + key + '/' + value.contentUrl, 
            COMMON.COPYRIGHT
        );

        return teaser;
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
            orientation, 1.5, 1.2, 0, 0,
            header, data, footer
        );

         const viewer_el = document.getElementById(id);
        viewer_el.className = section_name + '-' + 'curation' + '-' + 'viewer';

    }
}