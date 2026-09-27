'use strict';

import { SiteLibrary } from "../modules/common/SiteLibrary.js";
import { Templates } from "../modules/site/Templates.js";
import { ELEMENT_TYPE, COMMON } from "../modules/common/Constants.js"
import { siteMeta } from "../modules/site/siteMeta.js";
import { ViewerStateManager } from "../modules/viewerWindow/ViewerStateManager.js";
import { BaseView } from "./base/BaseView.js";

export class PhotologSection extends BaseView {
    constructor(MainService, BlogService) {
        super();

        this.main_service = MainService;
        this.blog_service = BlogService;
        this.initialize();

        this._BASE_PATH = "./assets/data/blog/photolog/";
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

    createSectionItem(id, thumbnail_path, title, text, photos_path) {
        const thumbnail = SiteLibrary.createImgElement(
            siteMeta.photolog.thumbnailClassName,
            null,
            thumbnail_path,
            siteMeta.photolog.thumbnailImgAlt
        );

        const teaser = SiteLibrary.createImgTitleCaption(
            thumbnail,
            SiteLibrary.truncateText(title[0], 16),
            SiteLibrary.truncateText(text[0], 70)
        );
        
        teaser.className = siteMeta.photolog.teaserClassName;
        
        const section_config = siteMeta.selectSectionConfig('photolog');
        this.generateTeaserEvent(
            section_config.typeName,
            teaser, 
            id, 
            section_config.sectionHeaderIcon,
            title, 
            text.toString(), 
            photos_path,
            COMMON.COPYRIGHT
        );
        
        return teaser;
    }

    generateTeaserEvent(type, element, id, section_icon, title, header_contents, main_contents, footer_contents) {        
        element.addEventListener('click', e => {
            this.onTeaserClick(e, type, id, section_icon, title, header_contents, main_contents, footer_contents);            
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
                this.generateSectionItems('header', await this.blog_service.buildPhotologData(), config),
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
                value.content_id,
                this._BASE_PATH + value.thumbnail,
                Object.keys(value.content),
                Object.values(value.content),
                value.photos
            );

            frag.appendChild(sectionItemElement);

            if (++index < data.size) {
                frag.appendChild(document.createElement('hr'));
            }      
        }

        element.appendChild(frag);

        return element;
    }

    async onTeaserClick(e, blog_type, id, section_icon, title, header, contents, footer) {
        e.preventDefault();

        const config = this.main_service.buildViewerConfig(
            COMMON.VIEWER_PREFIX + id, 
            56, 
            40,
            blog_type, 
            section_icon, 
            title, 
            24
        );

        try {
            super.mountContents(
                'photolog',
                config, 
                COMMON.TASKBAR_PREFIX + id,
                header, 
                this.createPhotoContents(contents), 
                footer
            );
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
            44, 
            38,
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

    createPhotoContents(data) {
        const photo_container = document.createElement(ELEMENT_TYPE.DIV);
        photo_container.className = 'photo-container';

        const frag = document.createDocumentFragment();
               
        for (const content of data) {
            const image = SiteLibrary.createImgElement(
                siteMeta.photolog.photoClassName,
                '',
                this._BASE_PATH + content,
                siteMeta.photolog.photoImgAlt
            );

            image.loading = 'lazy';

            frag.appendChild(image);
        }

        photo_container.appendChild(frag);
        
        return photo_container;
    }
}