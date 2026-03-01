import { SiteLibrary } from "../modules/common/SiteLibrary.js";
import { About } from "../entities/About.js";

export class AboutDAO {
    constructor() {
        this._ABOUT_DATA_PATH = "/assets/data/about-data.json";
    }

    static async create() {
        const dao = new AboutDAO();
        await dao.initialize();
        return dao;
    }

    async initialize() {
        // DB CONN JSON 반환
        this.DB = await SiteLibrary.loadJson(this._ABOUT_DATA_PATH);
        this.entity = this.createEntity(this.DB);
    }

    createEntity(data) {        
        const entity = new About(data);
        return entity;
    }

    findAll() {
        return this.entity;
    }

    findTitle() {
        return this.entity.title;
    }

    findPhotos() {
        return this.entity.photos;
    }

    findSpecs() {
        return this.entity.specs;
    }

    findContacts() {
        return this.entity.contacts;
    }
}