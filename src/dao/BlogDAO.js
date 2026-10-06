import { SiteLibrary } from "../modules/common/SiteLibrary.js";

export class BlogDAO {
    constructor() {
        this._BLOG_DATA_PATH = "/assets/data/blog/";
    }

    static async create() {
        const dao = new BlogDAO();
        await dao.initialize();
        return dao;
    }

    async initialize() {}

    async findWritings() {
        const data = await SiteLibrary.loadJson(`${this._BLOG_DATA_PATH}writings/writings-data.json`);
        return data;
    }

    async findArchive() {
        const data = await SiteLibrary.loadJson(`${this._BLOG_DATA_PATH}archive/archive-data.json`);
        return data;
    }

    async findLifelog() {
        const data = await SiteLibrary.loadJson(`${this._BLOG_DATA_PATH}lifelog/lifelog-data.json`);
        return data;
    }

    async findReflection() {
        const data = await SiteLibrary.loadJson(`${this._BLOG_DATA_PATH}reflection/reflection-data.json`);
        return data;
    }

    /*photolog 관련 메서드*/
    async findPhotolog() {
        const data = await SiteLibrary.loadJson(`${this._BLOG_DATA_PATH}photolog/photolog-data.json`);
        return data;
    }
}