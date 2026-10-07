'use strict';

import { SiteLibrary } from "../modules/common/SiteLibrary.js";
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
                super.metaData(this.dao.findWritings().entries),
                super.metaData(this.dao.findReflection().entries),
                super.metaData(this.dao.findLifelog().entries),
                super.metaData(this.dao.findArchive().entries),
                super.metaData(this.dao.findPhotolog().entries)
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
            oldMyWeb: super.toSectionMap(this.dao.findOldMyWeb()),
            thanksTo: super.toSectionMap(this.dao.findThanksTo())
        };

        return Links;
    }

    async buildPhotologData() {
        const contents_records = super.toSectionMap(this.dao.findPhotolog());
        const thumbnail_records = super.toSectionMap(this.dao.findPhotologThumbnails());
        const photo_records =  super.toSectionMap(this.dao.findPhotologPhotos());
        
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
}