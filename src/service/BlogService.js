'use strict';

import { BaseService } from "./common/BaseService.js";
import { BlogDAO } from '../dao/BlogDAO.js';

export class BlogService extends BaseService {
    constructor() {
        super();
    }

    async initialize() {
        this.dao = await BlogDAO.create();
    }

    async buildReflectionList() {
        const records = await this.dao.findReflection();
        return super.metaData(records.entries);
    }

    async buildLifelogList() {
        const records = await this.dao.findLifelog();
        return super.metaData(records.entries);
    }

    async buildArchiveList() {
        const records = await this.dao.findArchive();
        return super.metaData(records.entries);
    }

    async buildWritingsList() {
        const records = await this.dao.findWritings();
        return super.metaData(records.entries);
    }

    async buildPhotologList() {
        const records = await this.dao.findPhotolog();
        return super.metaData(records.entries);
    }


    async handleDeepLink() {
        const params = new URLSearchParams(location.search);

        if (params.size <= 0) return;
        

        const data = await this.buildWritingsList();       
        const record = data.get(id);

        return params;
    }
}