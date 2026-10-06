'use strict';

import { SiteLibrary } from "../../modules/common/SiteLibrary.js";

export class BaseService {
    constructor() {}

    toSectionMap(data) {
        const dtoMap = new Map();

        for (const [key, value] of Object.entries(data)) {
            dtoMap.set(key, value);
        }

        return dtoMap;
    }

    async metaData(data) {
        const dtoMap = new Map();

        for (const [key, value] of Object.entries(data)) {
            const blog = {
                date : value.date,
                id: await SiteLibrary.hashString(key),
                location: value.location,
                type: value.type,
                title: value.title,
                tags: value.tags,
                description: value.description,
                contentUrl: value.contentUrl,
                width: value.width
            };

            dtoMap.set(key, blog);
        }

        return dtoMap;
    }
}