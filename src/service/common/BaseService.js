'use strict';

import { SiteLibrary } from "../../modules/common/SiteLibrary.js";

export class BaseService {
    constructor() {}

    toPostMap(data) {
        const dtoMap = new Map();

        for (const [key, value] of Object.entries(data)) {
            dtoMap.set(key, value);
        }

        return dtoMap;
    }

    async metaData(data) {
        const dtoData = this.toPostMap(data);

        const dtoMap = new Map();        
        for (const [key, value] of dtoData) {
            const blog = {
                content_id: await SiteLibrary.hashString(key + value[1] + value[2]),
                region: value[0],
                type: value[1],
                title: value[2],
                summary: value[3],
                content_path: value[4],
                width: value[5]
            };

            dtoMap.set(key, blog);
        }

        return dtoMap;
    }
}