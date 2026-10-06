'use strict';

import { BlogDAO } from '../dao/BlogDAO.js';
import { SiteLibrary } from '../modules/common/SiteLibrary.js';
import { BaseService } from "./common/BaseService.js";

export class BlogService extends BaseService {
    constructor() {
        super();
    }

    async initialize() {
        this.dao = await BlogDAO.create();
    }

    async buildReflectionListData() {
        const records = await this.dao.findReflection();
        return super.metaData(records.entries);
    }

    async buildLifelogListData() {
        const records = await this.dao.findLifelog();
        return super.metaData(records.entries);
    }

    async buildArchiveListData() {
        const records = await this.dao.findArchive();
        return super.metaData(records.entries);
    }

    async buildWritingsListData() {
        const records = await this.dao.findWritings();
        return super.metaData(records.entries);
    }

    async buildPhotologData() {
        const records = await this.dao.findPhotolog();
        
        const dtoMap = new Map();        
        for (const [key, value] of Object.entries(records.entries)) {
            const photolog = {
                content_id: await SiteLibrary.hashString(key),
                content: value,
                thumbnail: records.thumbnails[key],
                photos: records.photos[key]
            };
            
            dtoMap.set(key, photolog);
        }

        return dtoMap;
    }
}