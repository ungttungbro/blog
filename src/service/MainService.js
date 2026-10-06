'use strict';

import { SiteLibrary } from "../modules/common/SiteLibrary.js";
import { viewerConfig } from "../modules/viewerWindow/viewerConfig.js";
import { MainDAO } from '../dao/MainDAO.js';
import { BaseService } from "./common/BaseService.js";

export class MainService extends BaseService {
    constructor() {
        super();

        this.aboutData = null;
        this.linksData = null;
        this.writings = null;
        this.reflection = null;
        this.lifelog = null;
        this.archive = null;
        this.photolog = null;
    }

    async initialize() {
        try {
            //dao를 호출하여 초기화함 (비동기 초기화)  
            this.dao = await MainDAO.create();

            [
                this.aboutData,
                this.linksData,
                this.writings,
                this.reflection,
                this.lifelog,
                this.archive,
                this.photolog,
            ] = await Promise.all([
                this.buildAboutData(),
                this.buildLinksData(),
                super.metaData(this.dao.findWritings()),
                super.metaData(this.dao.findReflection()),
                super.metaData(this.dao.findLifelog()),
                super.metaData(this.dao.findArchive()),
                this.buildPhotologData()
            ]);
        } catch (error) {
            console.log ('Main Service : ', error);
        }
    }

    buildAboutData() { 
        const about = {
            specs: this.buildSpecsData(),
            contacts: this.buildContactsData(),
            photos: this.buildPhotosData()
        };

        return about;
    }

    buildPhotosData() {
        const photo_records = this.dao.findAboutPhotos(); 
        const photo_path = SiteLibrary.generateRandomNumber(photo_records.length);

        const dtoMap = new Map();
        dtoMap.set('featured_photo_path', photo_records[photo_path]);
        dtoMap.set('photo_records_size', photo_records.length);
        dtoMap.set('photos_data', photo_records);

        return dtoMap;
    }

    buildSpecsData() {
        const spec_records = this.dao.findAboutSpecs();

        const dtoMap = new Map();
        dtoMap.set('닉네임', spec_records['닉네임']);
        //dtoMap.set('전공', spec_records['전공']);
        //dtoMap.set('직업', spec_records['직업']);

        return dtoMap;
    }

    buildContactsData() {
        const contact_records = this.dao.findAboutContacts();

        const dtoMap = new Map();
        dtoMap.set('이메일', contact_records['email']);
        dtoMap.set('홈페이지', contact_records['homepage']); 
        dtoMap.set('깃허브', contact_records['github']); 
          
        return dtoMap;
    }

    buildLinksData() { 
        const Links = {
            oldMyWeb: super.toPostMap(this.dao.findOldMyWeb()),
            thanksTo: super.toPostMap(this.dao.findThanksTo())
        };

        return Links;
    }

    async buildPhotologData() {
        const contents_records = super.toPostMap(this.dao.findPhotolog());
        const thumbnail_records = super.toPostMap(this.dao.findPhotologThumbnails());
        const photo_records = super.toPostMap(this.dao.findPhotologPhotos());
        
        const dtoMap = new Map();
        for (const [key, value] of contents_records) {
            const photolog = {
                content_id: await SiteLibrary.hashString(key),
                content: value,
                thumbnail: thumbnail_records.get(key),
                photos: photo_records.get(key)
            };
            
            dtoMap.set(key, photolog);
        }

        return dtoMap;
    }

    buildViewerConfig(viewer_id, width, height, content_type, section_icon, title, title_truncate_length) {        
        const config = structuredClone(viewerConfig);    
       
        config.element.elementId = viewer_id;
        config.element.offsetElementId = 'taskbar';
        config.element.className = 'viewer';

        config.layout.width = width + 'rem';
        config.layout.height = height + 'rem';
        config.layout.left = SiteLibrary.pxToRem(((window.innerWidth - SiteLibrary.remToPx(width)) / 2)) + 'rem';
        config.layout.top = SiteLibrary.pxToRem(((window.innerHeight - SiteLibrary.remToPx(height)) / 2)) + 'rem';

        config.meta.contentType = content_type;
        config.meta.titleIconPath = section_icon;
        config.meta.titleText = SiteLibrary.truncateText(title, title_truncate_length);

        return config;
    }

    handleDeepLink() {
        const params = new URLSearchParams(location.search);
        return params;
    }
}