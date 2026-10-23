'use strict';

import { SiteLibrary } from "../../modules/common/SiteLibrary.js";
import { Templates } from "../../modules/site/Templates.js";
import { COMMON } from "../../modules/common/Constants.js";
import { taskbar } from "../../modules/taskbar/TaskBar.js";

export class WritingsController {
    constructor(MainService, BlogService, View) {
        this.curation_service = MainService;
        this.original_service = BlogService;;
        this.section_view = View;

        this._BASE_PATH = "/assets/data/blog/writings/";
        this._SECTION_NAME = "writings";

        this.initialize();
    }
   
    async initialize() {}

    /**
     * Writings 섹션 블록을 표현한다.
     * 섹션 블록은 큐레이션 data를 활용하므로 curation_service를 활용한다.
     */
    async displaySection() {
        const CurationDTO = await this.curation_service.getWritings();
        
        this.section_view.setCurationDTO(CurationDTO);

        this.section_view.setSectionHeaderClickHandler(
            (config) => 
                this.presentSectionHeaderContent(config)
        );

        this.section_view.setPostClickHandler(
            (type, key, value, config) => 
                this.presentOpenPost(type, key, value, config)
        );

        this.section_view.show();
    }

    /**
     * 콜백형식으로 이벤트 등록한것을 뷰로부터 넘겨받음
     * Section Header와 연결됨
     */
    async presentSectionHeaderContent(config) {
        const data = await this.original_service.getWritings();

        let items;
        if (taskbar.taskBarElement.dataset.column > 2) {
            items = this.section_view.generateWritingsViewer(
                data, 
                this.section_view.getPostClickHandler()
            );
        } else {
            items = this.section_view.generateSectionItems(
                config.blogTypeName,
                data, 
                config, 
                this.section_view.getPostClickHandler()
            );
        }

        Templates.openPost(
            config.listViewerId,
            config.blogTypeName,
            config.sectionHeaderIcon,
            config.sectionListName,
            'landscape', 1.25, 0.8, 0, 0,
            items,
            null,
            COMMON.COPYRIGHT
        );
    }

     /**
     * 콜백형식으로 이벤트 등록한것을 뷰로부터 넘겨받음
     */
    async presentOpenPost(type, key, value, config) {
        const data = await this.presentWritings(
            this._BASE_PATH + key + '/' + value.contentUrl
        );

        const element = this.createWritingsItemDetail(type);
        const writings_viewer_item_detail_el = document.getElementById('blog-post-list-all-viewer')
            ?.querySelector('.writings-viewer-item-detail');
        
        if(writings_viewer_item_detail_el && type!=='curation-post') {
            element.appendChild(Templates.createContentPanel('writings-section-item-panel', data));      
        } else {
            Templates.openPost(
                COMMON.VIEWER_PREFIX + value.id,
                config.blogTypeName,
                config.sectionHeaderIcon,
                value.title,
                value.orientation, 1, 0.8, 0, 0,
                null, 
                Templates.createContentPanel('writings-section-item-panel', data), 
                COMMON.COPYRIGHT
            );    
        }    
    }

    createWritingsItemDetail(type) {
        let writings_viewer_item = document.getElementById('blog-post-list-all-viewer')
                            ?.querySelector('.writings-viewer-item-detail');

        if(writings_viewer_item && type!=='curation-post') {
            writings_viewer_item.innerHTML='';
            writings_viewer_item.scrollTop = 0;
        } else {
            writings_viewer_item = document.createElement('div');
            writings_viewer_item.className = 'writings-viewer-item-detail';
        }

        return writings_viewer_item;
    }

   async presentWritings(content_url) {
        return await SiteLibrary.loadText(content_url);
    }
}