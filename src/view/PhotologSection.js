'use strict';

import { SiteLibrary } from "../modules/common/SiteLibrary.js";
import { Templates } from "../modules/site/Templates.js";
import { ELEMENT_TYPE, COMMON } from "../modules/common/Constants.js"
import { siteMeta } from "../modules/site/siteMeta.js";
import { ViewerStateManager } from "../modules/viewerWindow/ViewerStateManager.js";
import { taskbar } from "../modules/taskbar/TaskBar.js";
import { BaseView } from "./common/BaseView.js";

export class PhotologSection extends BaseView {
    constructor(MainService, BlogService) {
        super();

        this.main_service = MainService;
        this.blog_service = BlogService;
        this.initialize();

        this._BASE_PATH = "/assets/data/blog/photolog/";
    }

    async initialize() { }

    show() {
        try {
            this.render();
        } catch (error) {
            console.log('error state : ', error);
        }
    }

    render() {
        const photolog = document.getElementById('photolog');
        photolog.appendChild(super.createSection('photolog', 'photolog-items', this.main_service.photolog));
    }

    createSectionItem(id, thumbnail_path, title, text, key, photos_path) {
        const thumbnail = SiteLibrary.createImgElement(
            siteMeta.photolog.thumbnailClassName,
            null,
            thumbnail_path,
            siteMeta.photolog.thumbnailImgAlt
        );

        const teaser = SiteLibrary.createImgTitleCaption(
            thumbnail,
            SiteLibrary.truncateText(title, 16),
            SiteLibrary.truncateText(text, 70)
        );
        
        teaser.className = siteMeta.photolog.teaserClassName;
        
        const section_config = siteMeta.selectSectionConfig('photolog');
        this.generateTeaserEvent(
            section_config.typeName,
            teaser, 
            id,
            key,
            section_config.sectionHeaderIcon,
            title, 
            text, 
            photos_path,
            COMMON.COPYRIGHT
        );
        
        return teaser;
    }

    generateTeaserEvent(type, element, id, key, section_icon, title, header_contents, main_contents, footer_contents) {        
        element.addEventListener('click', e => {
            this.onTeaserClick(e, type, id, key, section_icon, title, header_contents, main_contents, footer_contents);            
        });
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
            this.onSectionHeaderClick (
                e, 
                config.typeName, 
                config.photologListViewerId,
                config.sectionHeaderIcon,
                config.photologSectionListName,
                this.generateSectionItems('header', await this.blog_service.buildPhotologList(), config),
                null,
                COMMON.COPYRIGHT
            );
        });

        return section_header;
    }
    
    generateSectionItems(type, data, config) {
        const frag = document.createDocumentFragment();

        const element = document.createElement(ELEMENT_TYPE.DIV);
        element.className = config.teaserListClassName;

        let index = 0;
        for (const [key, value] of data) {
            const sectionItemElement = this.createSectionItem(
                value.id,
                this._BASE_PATH + "thumbnails/" + value.thumbnails,
                value.title,
                value.description +
                            "<br>" +
                            "<p style=\"font-size:0.85rem; color:var(--base_anchor_tag_hover_color);\">" +
                            "&#128247;&nbsp;&nbsp" +
                            value.date + " · " +
                            value.tags.map(tag => '#' + tag).join(" · ") +
                            "</p>",
                key,
                value.files
            );

            frag.appendChild(sectionItemElement);   
        }

        element.appendChild(frag);

        return element;
    }

    async onTeaserClick(e, blog_type, id, key, section_icon, title, header, contents, footer) {
        e.preventDefault();

        const config = this.main_service.buildViewerConfig(
            COMMON.VIEWER_PREFIX + id, 
            50, 
            37,
            blog_type, 
            section_icon, 
            title, 
            24
        );

        try {
            const photo_container_el = this.createPhotoContents(key, contents);

            super.mountContents(
                'photolog',
                config, 
                COMMON.TASKBAR_PREFIX + id,
                header, 
                photo_container_el, 
                footer
            );

            const photo_container_parent = photo_container_el.closest('#content-area');

            if (taskbar.taskBarElement.dataset.column > 2) {
                photo_container_el.style.height =
                `${photo_container_parent.clientHeight}px`;

                const observer = new ResizeObserver(() => {
                    requestAnimationFrame(() => {
                        photo_container_el.style.height =
                            `${photo_container_parent.clientHeight}px`;
                    });
                });

                observer.observe(photo_container_parent);
            }

            this.generatePhotoScrollEvent(photo_container_parent, photo_container_el);
        } catch(error) {
            console.warn('Phtolog Teaser Event : ', error);
        } finally {
            const element = document.getElementById(COMMON.VIEWER_PREFIX + id);
            element.dataset.group = config.meta.contentType;

            ViewerStateManager.stateLog(element);
        }
    }

    onSectionHeaderClick(e, blog_type, id, section_icon, title, header, contents, footer) {
        e.preventDefault();

        const config = this.main_service.buildViewerConfig(
            COMMON.VIEWER_PREFIX + id, 
            42, 
            35,
            blog_type, 
            section_icon, 
            title, 
            18
        );

        try {
            super.mountContents(
                'photolog',
                config, 
                COMMON.TASKBAR_PREFIX + id,
                header, 
                contents, 
                footer
            );
        } catch(error) {
            console.warn('Section Header Event : ', error);
        } finally {
            const element = document.getElementById(COMMON.VIEWER_PREFIX + id);
            element.dataset.group = config.meta.contentType;

            ViewerStateManager.stateLog(element);
        }
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