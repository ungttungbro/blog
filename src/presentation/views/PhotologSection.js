'use strict';

import { SiteLibrary } from "../../modules/common/SiteLibrary.js";
import { Templates } from "../../modules/site/Templates.js";

import { taskbar } from "../../modules/taskbar/TaskBar.js";

import { ELEMENT_TYPE, COMMON } from "../../modules/common/Constants.js";
import { siteMeta } from "../../modules/site/siteMeta.js";

export class PhotologSection {
    constructor() {
        this.initialize();

        this._BASE_PATH = "/assets/data/blog/photolog/";
        this._SECTION_NAME = "photolog";
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
            console.log('[ Photolog Section ] : ', error);
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

    createSectionItem(id, orientation, thumbnail_path, title, text, photos_path) {
        const thumbnail = SiteLibrary.createImgElement(
            siteMeta.photolog.thumbnailClassName,
            null,
            thumbnail_path,
            siteMeta.photolog.thumbnailImgAlt
        );

        const teaser = SiteLibrary.createImgTitleCaption(
            thumbnail,
            SiteLibrary.truncateText(title, 16),
            text
        );
        
        teaser.className = siteMeta.photolog.teaserClassName;
        
        const section_config = siteMeta.selectSectionConfig('photolog');
        this.generateTeaserEvent(
            section_config.typeName,
            teaser, 
            id,
            orientation,
            section_config.sectionHeaderIcon,
            title, 
            text, 
            photos_path,
            COMMON.COPYRIGHT
        );
        
        return teaser;
    }

    createPhotoContents(key, data) {
        const photo_container = document.createElement(ELEMENT_TYPE.DIV);
        photo_container.className = 'photo-container';

        const frag = document.createDocumentFragment();
               
        for (const content of data) {
            const image = SiteLibrary.createImgElement(
                siteMeta.photolog.photoClassName,
                '',
                this._BASE_PATH + key + '/' + content,
                siteMeta.photolog.photoImgAlt
            );

            image.loading = 'lazy';

            frag.appendChild(image);
        }

        photo_container.appendChild(frag);
        
        return photo_container;
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

        section_header.addEventListener('click',  async e => {
            e.preventDefault();

            const data = await this.getOriginalDTO();            
            const items = this.generateSectionItems('post-index', data, config);

            Templates.openPost(
                config.photologListViewerId,
                config.typeName,
                config.sectionHeaderIcon,
                config.photologSectionListName,
                'landscape', 0.9, 0.8, 0, 0,
                items,
                null,
                COMMON.COPYRIGHT
            );

            const element = document.getElementById(config.photologListViewerId);
            element.querySelector('#viewer-maximize-button').style.display = 'none';
        });

        return section_header;
    }
    
    generateSectionItems(type, data, config) {
        const frag = document.createDocumentFragment();

        const element = document.createElement(ELEMENT_TYPE.DIV);

        if (type === 'contents') {
            element.className = config.teaserListClassName;
        } else {
            element.className = 'post-index';
        }

        let index = 0;
        for (const [key, value] of data) {
            const sectionItemElement = this.createSectionItem(
                value.id,
                value.orientation,
                this._BASE_PATH + "thumbnails/" + value.thumbnails,
                value.title,
                value.description +
                            "<br>" +
                            "<p style=\"font-size:0.9rem; color:var(--font-color-anchor-color-A); line-height: 3;\">" +
                            "&#128247;&nbsp;&nbsp" +
                            value.date + " · " +
                            value.tags.map(tag => '#' + tag).join(" · ") +
                            "</p>",
                this._BASE_PATH + key + '/' + value.contentUrl
            );

            frag.appendChild(sectionItemElement);
            
            if (++index < data.size) {
                frag.appendChild(document.createElement('hr'));
            }
        }

        element.appendChild(frag);

        return element;
    }

    generateTeaserEvent(section_name, element, id, orientation, section_icon, title, header, contents, footer) {        
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
            orientation, 1, 0.7, 0, 0,
            header, data, footer
        );

        const photo_container_el = document.getElementById(id).querySelector('.photo-container');
        const photo_container_parent = photo_container_el.closest('#content-area');
        const footer_panel = photo_container_parent.querySelector('.photolog-footer-panel');

        if (taskbar.taskBarElement.dataset.column > 2) {
            photo_container_el.style.height =
            `${photo_container_parent.clientHeight}px`;

            const observer = new ResizeObserver(() => {
                requestAnimationFrame(() => {
                    photo_container_el.style.height =
                        `${photo_container_parent.clientHeight - footer_panel.clientHeight}px`;
                });
            });

            observer.observe(photo_container_parent);
        }

        this.generatePhotoScrollEvent(photo_container_parent, photo_container_el);
    }


    generatePhotoScrollEvent(parent_el, target_el) {
        parent_el.addEventListener('wheel', (event) => {
            passive: false;

            const atBottom =
                parent_el.scrollTop + parent_el.clientHeight >=
                parent_el.scrollHeight - 1;

            const atLeft =
                target_el.scrollLeft <= 0;

            const atRight =
                target_el.scrollLeft + target_el.clientWidth >=
                target_el.scrollWidth - 1;

            // 부모가 맨 아래이고, 아래로 스크롤
            if (atBottom && event.deltaY > 0 && !atRight) {
                target_el.scrollLeft += event.deltaY;
                event.preventDefault();
            }

            // 부모가 맨 아래이고, 위로 스크롤
            else if (atBottom && event.deltaY < 0) {
                // 사진이 아직 왼쪽으로 갈 수 있음
                if (!atLeft) {
                    target_el.scrollLeft += event.deltaY;
                    event.preventDefault();
                // 사진이 이미 맨 왼쪽이면 부모를 위로
                } else {
                    parent_el.scrollTop += event.deltaY;
                    event.preventDefault();
                }
            }
        });
    }
}