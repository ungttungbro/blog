'use strict';

import { PhotologDAO } from '../dao/PhotologDAO.js';
import { SiteLibrary } from '../modules/common/SiteLibrary.js';

export class PhotologService {
    constructor() {}
    
    async initialize() {
        try {
            //dao를 호출하여 초기화함 (비동기 초기화)  
            this.dao = await PhotologDAO.create();        

            //service name [photolog]
            this.serviceName = this.dao.findTitle();

            //photolog data
            this.photologData = await this.buildPhotologData();
        } catch (error) {
            console.log('Photolog Service : ', error);
        }
    }    

    async buildPhotologData() {
        const contents_records = this.buildContentsData();
        const thumbnail_records = this.buildThumbnailsData();
        const photo_records = this.buildPhotosData();
        
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


    buildThumbnailsData() {
        const thumbnail_records = this.dao.findThumbnails();

        const dtoMap = new Map();
        for (const [key, value] of Object.entries(thumbnail_records)) {
            dtoMap.set(key, value);
        }

        return dtoMap;
    }

    buildContentsData() {
        const contents_records = this.dao.findContents();

        const dtoMap = new Map();

        for (const [key, value] of Object.entries(contents_records)) {
            dtoMap.set(key, value);
        }

        return dtoMap;
    }

    buildPhotosData() {
        const photo_records = this.dao.findPhotos(); 

        const dtoMap = new Map();

        for (const [key, value] of Object.entries(photo_records)) {
            dtoMap.set(key, value);
        }

        return dtoMap;
    }
}