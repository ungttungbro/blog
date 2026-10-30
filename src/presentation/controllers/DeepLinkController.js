'use strict';

import { Templates } from "../../modules/site/Templates.js";

export class DeepLinkController {
    constructor(BlogService) {
        this.original_service = BlogService;

        this._SECTION_NAME = 'section';
        this._ID = 'id';
        this._ORIENTATION = 'orientation';

        this.initialize();
    }

    setSectionName(section_name) {
        this.section_name = section_name;
    }

    getSectionName() {
        return this.section_name;
    }

    setSectionMeta(section_meta) {
        this.section_meta = section_meta;
    }

    getSectionMeta() {
        return this.section_meta;
    }
   
    async initialize() {
        const params = new URLSearchParams(location.search);
        if (params.size !== 3) return "Invalid URL parameters: expected 3 parameters."

        this.section_name = params.get(this._SECTION_NAME);
        this.id = params.get(this._ID);
        this.orientation = params.get(this._ORIENTATION);

        const record = await this.getContentByParams(params);
        if (!record) {
            Templates.showMessage('요청하신 콘텐츠를 찾을수 없습니다.', 'warning');
            return "state of record is empty!!";
        }

        const el = this.getSectionElement();
        if (!el) return "state of element is empty!!";

        this.showContent(el, this.section_name, this.id, record);
    }

    showContent(element, section_name, key, value) {
        if (section_name === 'archive') {
            element.presentPost(section_name, key, value);
        } else {
            element.presentPost(section_name, key, value, element.getPostClickHandler());
        }
    }

    async getContentByParams(params) {
        const section = params.get(this._SECTION_NAME);
        const id = params.get(this._ID);
        const record = this.original_service.getContentByParams(section, id);

        return record;
    }

    getSectionElement() {
        const section_meta = this.getSectionMeta();
        const section_el = section_meta.element;
        return section_el;
    }
}