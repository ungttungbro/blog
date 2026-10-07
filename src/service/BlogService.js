'use strict';

import { BaseService } from "./common/BaseService.js";
import { BlogDAO } from '../dao/BlogDAO.js';
import { viewerConfig } from "../modules/viewerWindow/viewerConfig.js";
import { SiteLibrary } from "../modules/common/SiteLibrary.js";

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

    async getContentByParams(section, id) {        
        let data = null;

        switch(section) {
            case 'writings' : data = await this.buildWritingsList(); break;
            case 'lifelog' : data = await this.buildLifelogList(); break;
            case 'archive' : data = await this.buildArchiveList(); break;
            case 'reflection' : data = await this.buildReflectionList(); break;
            case 'photolog' : data = await this.buildPhotologList(); break;
            default : return;
        }

        const record = data.get(id);

        return record;
    }
}