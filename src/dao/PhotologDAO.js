import { SiteLibrary } from "../modules/common/SiteLibrary.js";
import { Photolog } from "../entities/Photolog.js";

export class PhotologDAO {
    constructor() {
        this._PHOTOLOG_DATA_PATH = "/assets/data/photolog-data.json";        
    }

    static async create() {
        const dao = new PhotologDAO();
        await dao.initialize();
        return dao;
    }

    async initialize() {
        // DB CONN JSON 반환
        this.DB = await SiteLibrary.loadJson(this._PHOTOLOG_DATA_PATH);
        this.entity = this.createEntity(this.DB);
    }

    createEntity(data) {        
        const entity = new Photolog(data);
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

    findContents() {
        return this.entity.contents;
    }

    findThumbnails() {
        return this.entity.thumbnails;
    }
}