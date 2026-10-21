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

        const items = this.generateCurationItems(data, section_meta_data);
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
            section_header_el.addEventListener('click',  async e => {
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
    }

    generateCurationItems(data, config) {
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

                writings_main_teaser_el.appendChild(this.createSectionItem(key, value));

                //frag.appendChild(writings_main_teaser_el);
                /*frag.appendChild(document.createElement('hr'));*/

                index++;
                continue;
            }
            

            /**processing */

            /*여기서부터는 data.next*/
            const sectionItemElement = this.createSectionItem(key, value);
            writings_section_item_el.appendChild(sectionItemElement);


            /*if (++index < data.size) {
                frag.appendChild(document.createElement('hr'));
            } */    
        }

        element.appendChild(writings_main_teaser_el);
        element.appendChild(writings_section_item_el);

        return element;
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
        element.className = 'writings-section-item-panel';

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

        const a =  document.createElement('a');
        a.href = '#';
        a.appendChild(element);

        const section_config = siteMeta.selectSectionConfig('writings');
        this.generatePostEvent(a, key, value, section_config);

        return a;
    }

    generatePostEvent(element, key, value, config) {
        element.addEventListener('mouseenter', () => {
            SiteLibrary.prefetch(
                element,
                this._BASE_PATH + key + '/' + value.contentUrl
            );
        });

        element.addEventListener('click', e => {
            e.preventDefault();
            this.presentPost(
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
}