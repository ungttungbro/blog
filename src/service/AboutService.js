'use strict';

import { SiteLibrary } from "../modules/common/SiteLibrary.js";
import { AboutDAO } from '../dao/AboutDAO.js';

export class AboutService {
    constructor() { }

    async initialize() {
        try {
            //dao를 호출하여 초기화함 (비동기 초기화)  
            this.dao = await AboutDAO.create();

            //service name [about]
            this.serviceName = this.dao.findTitle();

            //about data
            this.aboutData = this.buildAboutData();
        } catch (error) {
            console.log('About Service : ', error);
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
        const photo_records = this.dao.findPhotos(); 
        const photo_path = SiteLibrary.generateRandomNumber(photo_records.length);

        const dtoMap = new Map();
        dtoMap.set('featured_photo_path', photo_records[photo_path]);
        dtoMap.set('photo_records_size', photo_records.length);
        dtoMap.set('photos_data', photo_records);

        return dtoMap;
    }

    buildSpecsData() {
        const spec_records = this.dao.findSpecs();

        const dtoMap = new Map();
        dtoMap.set('닉네임', spec_records['닉네임']);
        //dtoMap.set('전공', spec_records['전공']);
        //dtoMap.set('직업', spec_records['직업']);

        return dtoMap;
    }

    buildContactsData() {
        const contact_records = this.dao.findContacts();

        const dtoMap = new Map();
        dtoMap.set('이메일', contact_records['email']);
        dtoMap.set('홈페이지', contact_records['homepage']); 
        dtoMap.set('깃허브', contact_records['github']); 
          
        return dtoMap;
    }
}