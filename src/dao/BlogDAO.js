import { SiteLibrary } from "../modules/common/SiteLibrary.js";
import { Blog } from "../entities/Blog.js";

export class BlogDAO {
    constructor() {
        this._BLOG_DATA_PATH = "/assets/data/blog-data.json";        
    }

    static async create() {
        const dao = new BlogDAO();
        await dao.initialize();
        return dao;
    }

    async initialize() {
        // DB CONN JSON 반환
        this.DB = await SiteLibrary.loadJson(this._BLOG_DATA_PATH);
        this.entity = this.createEntity(this.DB);
    }

    createEntity(data) {        
        const entity = new Blog(data);
        return entity;
    }

    findAll() {
        return this.entity;
    }

    findTitle() {
        return this.entity.title;
    }

    findPostList() {
        return this.entity.contents;
    }

    findArchive() {
        return this.entity.archive;
    }

    findLifelog() {
        return this.entity.lifelog;
    }

    findReflection() {
        return this.entity.reflection;
    }
}