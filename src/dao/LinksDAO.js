import { SiteLibrary } from "../modules/common/SiteLibrary.js";
import { Links } from "../entities/Links.js";

export class LinksDAO {
    constructor() {
        this._LINKS_DATA_PATH = "/assets/data/links-data.json";        
    }

    static async create() {
        const dao = new LinksDAO();
        await dao.initialize();
        return dao;
    }

    async initialize() {
        // DB CONN JSON 반환
        this.DB = await SiteLibrary.loadJson(this._LINKS_DATA_PATH);
        this.entity = this.createEntity(this.DB);
    }

    createEntity(data) {        
        const entity = new Links(data);
        return entity;
    }

    findAll() {
        return this.entity;
    }

    findTitle() {
        return this.entity.title;
    }

    findOldMyWeb() {
        return this.entity.oldMyWeb;
    }

    findThanksTo() {
        return this.entity.thanksTo;
    }
}