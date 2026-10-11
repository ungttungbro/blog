import { SiteLibrary } from "../../modules/common/SiteLibrary.js";
import { Templates } from "../../modules/site/Templates.js";

export class DeepLinkController {
    constructor(BlogService) {
        this.original_service = BlogService;

        this._SECTION_NAME = 'section';
        this._ID = 'id';
        this._ORIENTATION = 'orientation';

        this.header = null;
        this.contents = null;
        this.footer = null;

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
        if (!record) return "state of record is empty!!";

        const el = this.getSectionElement();
        if (!el) return "state of element is empty!!";

        this.contents = el._BASE_PATH + this.id + '/' + record.contentUrl;
        const content_map = this.createContentMap(this.section_name, record);

        this.showContent(
            el, this.id, this.section_name, this.getSectionMeta().icon, 
            record.title ? record.title : record.tags,
            this.orientation, content_map.header, content_map.contents, content_map.footer
        );
    }

    createContentMap(section_name, data) {
        const content_map = {
            writings: { header: null, contents: this.contents, footer: null },
            reflection: { header: null, contents: this.contents, footer: null },
            lifelog: { header: null, contents: this.contents, footer: this.lifelogFooterElement(data)},
            archive: { header: null, contents: this.contents, footer: null },
            photolog: { header: this.photologHeaderString(data), contents: this.contents, footer: null }
        };

        return content_map[section_name];
    }
 
    async showContent(el, id, section_name, section_icon, title, orientation, header, contents, footer) {
        el.presentPost(
            'viewer-content-' + await SiteLibrary.hashString(id),
            section_name,
            section_icon,
            title,
            orientation,
            header,
            contents,
            footer
        );
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

    lifelogFooterElement(data) {
        const footer_el = document.createElement('span');
                footer_el.className = 'footer';
                footer_el.innerHTML = "<p align='right' style='font-size:0.85rem; font-weight:400;'>" 
                    + Templates.symbol(data.type) + data.date + ' (' + data.location + ')'
                    + "</p>";
                footer_el.innerHTML += '&copy; Jonas';

        return footer_el;      
    }

    photologHeaderString(data) {
        if (!data.tags) return "DeepLink : photologHeaderString tag data is empty!!";

        const str = data.description + "<br>" +
          "<p style=\"font-size:0.85rem; color:var(--base_anchor_tag_hover_color);\">" +
            "&#128247;&nbsp;&nbsp" +
            data.date + " · " +
            data.tags.map(tag => '#' + tag).join(" · ") +
          "</p>";

        return str;
    }
}