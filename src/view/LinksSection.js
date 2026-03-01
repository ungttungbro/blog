'use strict';

import { ELEMENT_TYPE } from "../modules/common/Constants.js";
import { siteMeta } from "../modules/site/siteMeta.js";
import { SiteLibrary } from "../modules/common/SiteLibrary.js";
import { Templates } from "../modules/site/Templates.js";

export class LinksSection {
    constructor(links_service) {
        this.linksService = links_service;
        this.initialize();
    }

    async initialize() {
        const section_id = this.linksService.serviceName;
        this.linksSectionElement = document.getElementById(section_id);
    }

    show() {
        try {            
            this.renderLinks();
        } catch (error) {
            console.log('error state : ', error);
        }
    }

    renderLinks() {
        const links_section_header = Templates.createSectionHeader(
            siteMeta.links.sectionHeaderId,
            siteMeta.links.captionImgId,
            siteMeta.links.captionId,
            siteMeta.links.className,
            siteMeta.links.sectionHeaderIcon,
            siteMeta.links.text,
            siteMeta.links.sectionHeaderIconAlt
        );

        this.linksSectionElement.appendChild(links_section_header);

        const links_list = this.renderLinksList();
        this.linksSectionElement.appendChild(links_list);
    }

    renderLinksList() {
        const links_list = document.createElement(ELEMENT_TYPE.DIV);
        links_list.id = siteMeta.links.linkListId;

        const oldMyWeb = this.generateLinksItem(
            this.linksService.linksData.oldMyWeb,
            'Old My Web'
        );

        const thanks_to = this.generateLinksItem(
            this.linksService.linksData.thanksTo,
            'Thanks to...'
        );
        
        links_list.appendChild(oldMyWeb);        
        links_list.appendChild(thanks_to);
        
        return links_list;
    }

    generateLinksItem(links_view_data, links_name) {
        const frag = document.createDocumentFragment();

        const element = document.createElement(ELEMENT_TYPE.DIV);
        element.className = siteMeta.links.linkItemListClassName;

        const caption = document.createElement(ELEMENT_TYPE.DIV);
        caption.textContent = links_name;
        frag.appendChild(caption);

        frag.appendChild(document.createElement('hr'));
        const data = links_view_data;

        const ul = document.createElement('ul');
        
        for (const [_, value] of data) {
            const li = document.createElement('li');

            const a = document.createElement('a');
            a.href = value[0];
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.textContent = value[1];            
                    
            li.appendChild(a);
            ul.appendChild(li);
        }

        frag.appendChild(ul);

        element.appendChild(frag);

        return element;
    }
}