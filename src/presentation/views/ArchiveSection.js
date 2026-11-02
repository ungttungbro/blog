'use strict';

import { COMMON } from "../../modules/common/Constants.js";
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

        this.generatePostEvent(teaser, key, value, section_config);

        return teaser;
    }

    generatePostEvent(element, key, value, config) {
        element.addEventListener(
            'mouseenter', 
            () => { 
                SiteLibrary.prefetch(
                    element, 
                    this._BASE_PATH + key + '/' + value.contentUrl
                ); 
        });

        element.addEventListener('click', e => {
            e.preventDefault();
            this.presentPost(
                config.blogTypeName, 
                key,
                value
            );
        });
    }

    async presentPost(section_name, key, value) {
        const data = await SiteLibrary.loadText(this._BASE_PATH + key + '/' + value.contentUrl);
        const config = siteMeta.selectSectionConfig(section_name);
        const archive_item_caption_el = this.createHeaderCaption(value);

        const frag = document.createDocumentFragment();
        const range = document.createRange();
        const content_frag = range.createContextualFragment(data);

        frag.appendChild(archive_item_caption_el);
        frag.appendChild(content_frag);
        
        Templates.openPost(
            value.id,
            section_name,                 
            config.sectionHeaderIcon,
            value.title,
            value.orientation, 1.7, 1.4, 0, 0,
            null, 
            frag, 
            COMMON.COPYRIGHT
        );

        const viewer_el = document.getElementById(value.id);
        viewer_el.className = section_name + '-' + 'curation' + '-' + 'viewer';

        SiteLibrary.syncElementHeight(viewer_el.querySelector('.content-panel'), archive_item_caption_el);
    }

    createHeaderCaption(value) {
        const archive_item_caption_el = document.createElement('div');
        archive_item_caption_el.className = 'archive-item-caption';

        const emblem_el = Templates.createSiteEmblem(
            'site-emblem',
            '/assets/icons/emblem_white.png', 
            'site emblem'
        );

        archive_item_caption_el.appendChild(emblem_el);

        const title_el = document.createElement('div');
        title_el.className = 'title';
        title_el.textContent = value.title;

        archive_item_caption_el.appendChild(title_el);

        const meta_el = document.createElement('div');
        meta_el.className = 'meta';
        meta_el.textContent = 'Jonas' + ' · ' + value.date;

        archive_item_caption_el.appendChild(meta_el);

        return archive_item_caption_el;
    }
}