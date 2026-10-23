'use strict';

import { COMMON } from "../../modules/common/Constants.js";
import { siteMeta } from "../../modules/site/siteMeta.js";
import { SiteLibrary } from "../../modules/common/SiteLibrary.js";
import { Templates } from "../../modules/site/Templates.js";

export class LifelogSection {
    constructor() {
        this.initialize();

        this._BASE_PATH = "/assets/data/blog/lifelog/";
        this._SECTION_NAME = "lifelog";
    }

    async initialize(){}
    
    setCurationDTO(data) {
        this.curation_data = data;
    }

    getCurationDTO() {
        return this.curation_data;
    }

    setSectionHeaderClickHandler(handler) {
        this.onSectionHeaderClick = handler;
    }

    getSectionHeaderClickHandler() {
        return this.onSectionHeaderClick;
    }

    setPostClickHandler(handler) {
        this.onPostClick = handler;
    }

    getPostClickHandler() {
        return this.onPostClick;
    }

    show() {
        try {
            const el = document.getElementById(this._SECTION_NAME);
            const data = this.getCurationDTO();
            this.createSection(el, data);
        } catch (error) {
            console.log('[ Lifelog Section ] : ', error);
        }
    }

    createSection(el, data) {        
        const section_meta_data = siteMeta.selectSectionConfig(this._SECTION_NAME);
        if(!section_meta_data) return;

        const section_header_click_handler = this.getSectionHeaderClickHandler();
        const section_header = this.generateSectionHeader(section_meta_data, section_header_click_handler);
        Templates.createSectionHeaderEvent(section_header, section_meta_data.captionId);
        el.appendChild(section_header);

        const post_click_handler = this.getPostClickHandler();
        const items = this.generateSectionItems(data, section_meta_data, post_click_handler);
        el.appendChild(items);
    }

    generateSectionHeader(config, onSectionHeaderClick) {
        const section_header = Templates.createSectionHeader(
            config.captionImgId, 
            config.captionId,
            config.className, 
            config.sectionHeaderIcon, 
            config.captionText, 
            config.sectionHeaderIconAlt
        );

        this.generateSectionHeaderEvent(section_header, config, onSectionHeaderClick);

        return section_header;
    }

    generateSectionHeaderEvent(section_header_el, config, onSectionHeaderClick) {
        section_header_el.addEventListener('click', e => {
            e.preventDefault();
            onSectionHeaderClick(config);                    
        });
    }

    generateSectionItems(data, config, onTeaserClick) {
        const element = document.createElement('div');

        if(document.getElementById('lifelog').querySelector('.' + config.latestPostClassName)) {
            element.className = 'lifelog-viewer-menu';
        } else {
            element.className = config.latestPostClassName;
        }

        const frag = document.createDocumentFragment();

        let index = 0;
        for (const [key, value] of data) {
            const sectionItemElement = this.createSectionItem(element.className, key, value, onTeaserClick);

            frag.appendChild(sectionItemElement);
            
            if (++index < data.size) {
                frag.appendChild(document.createElement('hr'));
            }
        }

        element.appendChild(frag);

        return element;
    }

    createSectionItem(type, key, value, onTeaserClick) {
        const element = document.createElement('div');
        element.className = 'teaser-figure';

        const meta = Templates.symbol(value.type) + value.date + ' · ' + value.location;
        const meta_el = document.createElement('div');
        meta_el.className = 'meta';
        meta_el.innerHTML = meta;

        element.appendChild(meta_el);

        const title = value.tags.map(tag => '#' + tag).join(" · ");
        const title_el = document.createElement('div');
        title_el.className = 'title';
        title_el.textContent = title;

        element.appendChild(title_el);

        const teaser =  document.createElement('a');
        teaser.href = '#';
        teaser.appendChild(element);

        const section_config = siteMeta.selectSectionConfig('lifelog');

        this.generatePostEvent(teaser, type, section_config.blogTypeName, key, value, onTeaserClick);

        return teaser;
    }

    generatePostEvent(element, type, class_name, key, value, onTeaserClick) {
        element.addEventListener('mouseenter', () => {
            SiteLibrary.prefetch(
                element,
                this._BASE_PATH + key + '/' + value.contentUrl
            );
        });

        element.addEventListener('click', e => {
            e.preventDefault();
            onTeaserClick(type, class_name, key, value);
        });
    }

    async presentPost(key, value, config) {
        const data = await SiteLibrary.loadText(this._BASE_PATH + key + '/' + value.contentUrl);

        Templates.openPost(
            COMMON.VIEWER_PREFIX + value.id,
            config.blogTypeName,                 
            config.sectionHeaderIcon,
            value.tags.map(tag => '#' + tag).join(" · "),
            value.orientation, 1, 1.05, 0.8, 1.2,
            null, 
            data, 
            COMMON.COPYRIGHT
        );
    }

    generateLifelogViewer(data, onTeaserClick) {
        const frag = document.createDocumentFragment();

        const lifelog_viewer_menu = this.generateLifelogViewerMenu(data, onTeaserClick);
        const lifelog_viewer_item = document.createElement('div');
        lifelog_viewer_item.className = 'lifelog-viewer-item-detail';

        const photolog_icon = SiteLibrary.createImgElement(
            'lifelog-icon', 
            '', 
            'assets/icons/lifelog.png', 
            'lifelog-welcome-icon'
        );

        const lifelog_welcome_el = document.createElement('div');
        lifelog_welcome_el.className = 'lifelog-welcome';

        lifelog_welcome_el.appendChild(photolog_icon);
        lifelog_viewer_item.appendChild(lifelog_welcome_el);

        frag.appendChild(lifelog_viewer_menu);       
        frag.appendChild(lifelog_viewer_item);

        return frag;
    }

    generateLifelogViewerMenu(data, onTeaserClick) {
        const frag = document.createDocumentFragment();

        const element = document.createElement('div');
        element.className = 'lifelog-viewer-menu';

        let index = 0;
        for (const [key, value] of data) {            
            const sectionItemElement = this.createSectionItem(
                element.className,
                key, 
                value, 
                onTeaserClick
            );

            frag.appendChild(sectionItemElement);
            
            if (++index < data.size) {
                frag.appendChild(document.createElement('hr'));
            }
        }

        element.appendChild(frag);

        return element;
    }
}