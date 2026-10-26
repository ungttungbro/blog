'use strict';

import { COMMON } from "../../modules/common/Constants.js";
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
            console.log('[ Writings Section ] : ', error);
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
        const items = this.generateCurationItems(data, section_meta_data, post_click_handler);
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

    generateCurationItems(data, config, onTeaserClick) {
        const element = document.createElement('div');
        element.className = config.latestPostClassName;

        const writings_main_teaser_el = document.createElement('div');
        writings_main_teaser_el.className = 'curation-teaser-panel';

        const writings_section_item_el = document.createElement('div');
        writings_section_item_el.className = 'section-item-panel';

        let index = 0;
        for (const [key ,value] of data) {
            if (index < 1) {                
                writings_main_teaser_el.appendChild(SiteLibrary.createImgElement(
                    'main-teaser-thumbnail',
                    '',
                    this._BASE_PATH + key + '/' + value.thumbnails,
                    'writings thumbnail'
                ));

                writings_main_teaser_el.appendChild(this.createSectionItem('curation-post', key, value, onTeaserClick));

                index++;
                continue;
            }
            
            const sectionItemElement = this.createSectionItem('curation-post', key, value, onTeaserClick);
            writings_section_item_el.appendChild(sectionItemElement);
        }

        element.appendChild(writings_main_teaser_el);
        element.appendChild(writings_section_item_el);

        return element;
    }

    generateSectionItems(type, data, config, onTeaserClick) {
        const element = document.createElement('div');

        if(document.getElementById('writings').querySelector('.' + config.latestPostClassName)) {
            element.className = 'writings-viewer-menu';
        } else {
            element.className = config.latestPostClassName;
        }

        const frag = document.createDocumentFragment();

        let index = 0;
        for (const [key ,value] of data) {
            const sectionItemElement = this.createSectionItem(type, key, value, onTeaserClick);

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

        const meta_span = document.createElement('div');
        meta_span.className = 'meta';
        meta_span.innerHTML = value.type + ' · ' + value.date;
        meta_span.innerHTML += '<br>';

        element.appendChild(meta_span);

        const title_span = document.createElement('div');
        title_span.className = 'title';
        title_span.textContent = value.title;

        element.appendChild(title_span);

        const summary_span = document.createElement('div');
        summary_span.className = 'summary';
        summary_span.textContent = value.description;

        element.appendChild(summary_span);

        const teaser =  document.createElement('a');
        teaser.href = '#';
        teaser.appendChild(element);

        const section_config = siteMeta.selectSectionConfig('writings');
        this.generatePostEvent(teaser, type, key, value, section_config, onTeaserClick);

        return teaser;
    }

    generatePostEvent(element, type, key, value, config, onTeaserClick) {
        element.addEventListener('mouseenter', () => {
            SiteLibrary.prefetch(
                element,
                this._BASE_PATH + key + '/' + value.contentUrl
            );
        });

        element.addEventListener('click', e => {
            e.preventDefault();
            onTeaserClick(
                type,
                key,
                value,
                config
            );
        });
    }

    async presentPost(key, value, config) {
        const data = await SiteLibrary.loadText(this._BASE_PATH + key + '/' + value.contentUrl);

        Templates.openPost(
            COMMON.VIEWER_PREFIX + value.id,
            config.blogTypeName,
            config.sectionHeaderIcon,
            value.title,
            value.orientation, 1, 0.8, 0, 0,
            null, 
            data, 
            COMMON.COPYRIGHT
        );
    }

    generateWritingsViewer(data, onTeaserClick) {
        const frag = document.createDocumentFragment();

        const writings_viewer_menu = this.generateWritingsViewerMenu(data, onTeaserClick);
        const writings_viewer_item = document.createElement('div');
        writings_viewer_item.className = 'writings-viewer-item-detail';

        const icon = SiteLibrary.createImgElement(
            'writings-icon', 
            '', 
            'assets/icons/blog.png', 
            'writings-welcome-icon'
        );

        const writings_welcome_el = document.createElement('div');
        writings_welcome_el.className = 'writings-welcome';

        writings_welcome_el.appendChild(icon);
        writings_viewer_item.appendChild(writings_welcome_el);

        frag.appendChild(writings_viewer_menu);       
        frag.appendChild(writings_viewer_item);

        return frag;
    }

    generateWritingsViewerMenu(data, onTeaserClick) {
        const frag = document.createDocumentFragment();

        const element = document.createElement('div');
        element.className = 'writings-viewer-menu';

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