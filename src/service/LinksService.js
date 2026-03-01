'use strict';

import { LinksDAO } from '../dao/LinksDAO.js';

export class LinksService {
    constructor() {}

    async initialize() {
        try {
            //dao를 호출하여 초기화함 (비동기 초기화)  
            this.dao = await LinksDAO.create();

            //service name [links]
            this.serviceName = this.dao.findTitle();

            //links data
            this.linksData = this.buildLinksData();
        } catch (error) {
            console.log('Link Service', error);
        }
    }    

    buildLinksData() { 
        const Links = {
            oldMyWeb: this.buildOldMyWebData(),
            thanksTo: this.buildThanksToData()
        };

        return Links;
    }

    buildOldMyWebData() {
        const research_records = this.dao.findOldMyWeb();

        const dtoMap = new Map();

        for (const [key, value] of Object.entries(research_records)) {
            dtoMap.set(key, value);
        }

        return dtoMap;
    }

    buildThanksToData() {
        const research_records = this.dao.findThanksTo();

        const dtoMap = new Map();

        for (const [key, value] of Object.entries(research_records)) {
            dtoMap.set(key, value);
        }

        return dtoMap;
    }
}