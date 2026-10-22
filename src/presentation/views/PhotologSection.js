'use strict';

import { SiteLibrary } from "../../modules/common/SiteLibrary.js";
import { Templates } from "../../modules/site/Templates.js";
import { siteMeta } from "../../modules/site/siteMeta.js";

export class PhotologSection {
    constructor() {
        this.initialize();

        this._BASE_PATH = "/assets/data/blog/photolog/";
        this._SECTION_NAME = "photolog";
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
            console.log('[ Photolog Section ] : ', error);
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

    /* Section Header */
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

    /* Content items */
    generateSectionItems(data, config, onTeaserClick) {
        const element = document.createElement('div');

        if(document.getElementById('photolog').querySelector('.' + config.teaserListClassName)) {
            element.className = 'photolog-viewer-menu';
        } else {
            element.className = config.teaserListClassName;
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
        const thumbnail = SiteLibrary.createImgElement(
            siteMeta.photolog.thumbnailClassName,
            null,
            this._BASE_PATH + "thumbnails/" + value.thumbnails,
            siteMeta.photolog.thumbnailImgAlt
        );

        let teaser_description;
        if(type === 'photolog-viewer-menu') {
            teaser_description = value.tags.map(tag => '#' + tag).join(" · ");
        } else {
            teaser_description = value.description;
        }

        const teaser = SiteLibrary.createImgTitleCaption(
            thumbnail,
            value.title,
            teaser_description
        );
        
        teaser.className = siteMeta.photolog.teaserClassName;
        
        const section_config = siteMeta.selectSectionConfig('photolog');
        this.generateTeaserEvent(teaser, type, section_config.typeName, key, value, onTeaserClick);
        
        return teaser;
    }

    generateTeaserEvent(teaser_el, type, section_name, key, value, onTeaserClick) {
        teaser_el.addEventListener('click', e => {
            e.preventDefault();
            onTeaserClick(type, section_name, key, value);
        });
    }

    
    /* header content */
    generatePhotoViewer(data, onTeaserClick) {
        const frag = document.createDocumentFragment();

        const photolog_viewer_menu = this.generatePhotoViewerMenu(data, onTeaserClick);
        const photolog_viewer_item = document.createElement('div');
        photolog_viewer_item.className = 'photolog-viewer-item-detail';

        const photolog_icon = SiteLibrary.createImgElement(
            'photograhper', 
            '', 
            'assets/icons/photographer.png', 
            'photographer'
        );

        const photolog_welcome_el = document.createElement('div');
        photolog_welcome_el.className = 'photolog-welcome';

        photolog_welcome_el.appendChild(photolog_icon);
        photolog_viewer_item.appendChild(photolog_welcome_el);

        frag.appendChild(photolog_viewer_menu);       
        frag.appendChild(photolog_viewer_item);

        return frag;
    }

    generatePhotoViewerMenu(data, onTeaserClick) {
        const frag = document.createDocumentFragment();

        const element = document.createElement('div');
        element.className = 'photolog-viewer-menu';

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