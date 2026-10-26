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
            console.log('[ Reflection Section ] : ', error);
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

    generateSectionItems(data, config, onTeaserClick) {
        const element = document.createElement('div');

        if(document.getElementById('reflection').querySelector('.' + config.latestPostClassName)) {
            element.className = 'reflection-viewer-menu';
        } else {
            element.className = config.latestPostClassName;
        }

        const frag = document.createDocumentFragment();

        let index = 0;
        for (const [key ,value] of data) {
            const sectionItemElement = this.createSectionItem(element.className,
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

    createSectionItem(type, key, value, onTeaserClick) {
        const element = document.createElement('div');
        element.className = 'teaser-figure';

        const title = document.createElement('div');
        title.className = 'title';
        title.textContent = '「' + value.title + '」' + ' ';

        element.appendChild(title);

        const description = document.createElement('div');
        description.className = 'summary';
        description.textContent = value.description;

        element.appendChild(description);

        const meta = document.createElement('div');
        meta.className = 'meta';
        meta.innerHTML = (value.tags ?? []).map(tag => '#' + tag).join(" · ");

        element.appendChild(meta);


        const teaser =  document.createElement('a');
        teaser.href = '#';
        teaser.appendChild(element);

        const section_config = siteMeta.selectSectionConfig('reflection');
        this.generatePostEvent(teaser, type, section_config, key, value, onTeaserClick);       

        return teaser;
    }

    generatePostEvent(element, type, config, key, value, onTeaserClick) {
        element.addEventListener('mouseenter', () => { 
            SiteLibrary.prefetch(
                element, 
                this._BASE_PATH + key + '/' + value.contentUrl
            ); 
        });

        element.addEventListener('click', e => {
            e.preventDefault();
            onTeaserClick(type, key, value, config);
        });
    }

    generateReflectionViewer(data, onTeaserClick) {
        const frag = document.createDocumentFragment();

        const reflection_viewer_menu = this.generateReflectionViewerMenu(data, onTeaserClick);
        const reflection_viewer_item = document.createElement('div');
        reflection_viewer_item.className = 'reflection-viewer-item-detail';

        const icon = SiteLibrary.createImgElement(
            'reflection-icon', 
            '', 
            'assets/icons/reflection.png', 
            'reflection-welcome-icon'
        );

        const reflection_welcome_el = document.createElement('div');
        reflection_welcome_el.className = 'reflection-welcome';

        reflection_welcome_el.appendChild(icon);
        reflection_viewer_item.appendChild(reflection_welcome_el);

        frag.appendChild(reflection_viewer_menu);       
        frag.appendChild(reflection_viewer_item);

        return frag;
    }

    generateReflectionViewerMenu(data, onTeaserClick) {
        const frag = document.createDocumentFragment();

        const element = document.createElement('div');
        element.className = 'reflection-viewer-menu';

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