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

    async getReflection() {
        const records = await this.dao.findReflection();
        return super.metaData(records.entries);
    }

    async getLifelog() {
        const records = await this.dao.findLifelog();
        return super.metaData(records.entries);
    }

    async getArchive() {
        const records = await this.dao.findArchive();
        return super.metaData(records.entries);
    }

    async getWritings() {
        const records = await this.dao.findWritings();
        return super.metaData(records.entries);
    }

    async getPhotolog() {
        const records = await this.dao.findPhotolog();
        return super.metaData(records.entries);
    }

    async getContentByParams(section, id) {        
        let data = null;

        switch(section) {
            case 'writings' : data = await this.getWritings(); break;
            case 'lifelog' : data = await this.getLifelog(); break;
            case 'archive' : data = await this.getArchive(); break;
            case 'reflection' : data = await this.getReflection(); break;
            case 'photolog' : data = await this.getPhotolog(); break;
            default : return;
        }

        const record = data.get(id);

        return record;
    }
}