'use strict';

import { SiteLibrary } from "../../modules/common/SiteLibrary.js";
import { Templates } from "../../modules/site/Templates.js";
import { COMMON } from "../../modules/common/Constants.js";
import { taskbar } from "../../modules/taskbar/TaskBar.js";

export class LifelogController {
    constructor(MainService, BlogService, View) {
        this.curation_service = MainService;
        this.original_service = BlogService;;
        this.section_view = View;

        this._BASE_PATH = "/assets/data/blog/lifelog/";
        this._ICON_PATH = "/assets/icons/lifelog.png";
        this._SECTION_NAME = "lifelog";

        this.initialize();
    }
   
    async initialize() {}

    /**
     * Lifelog 섹션 블록을 표현한다.
     * 섹션 블록은 큐레이션 data를 활용하므로 curation_service를 활용한다.
     */
    async displaySection() {
        const CurationDTO = await this.curation_service.getLifelog();
        
        this.section_view.setCurationDTO(CurationDTO);

        this.section_view.setSectionHeaderClickHandler(
            (config) => 
                this.presentSectionHeaderContent(config)
        );

        this.section_view.setPostClickHandler(
            (type, section_name, key, value) => 
                this.presentOpenPost(type, section_name, key, value)
        );

        this.section_view.show();
    }

     /**
     * 콜백형식으로 이벤트 등록한것을 뷰로부터 넘겨받음
     * Section Header와 연결됨
     */
    async presentSectionHeaderContent(config) {
        const data = await this.original_service.getLifelog();

        let items;
        if (taskbar.taskBarElement.dataset.column > 2) {
            items = this.section_view.generateLifelogViewer(
                data, this.section_view.getPostClickHandler()
            );
        } else {
            items = this.section_view.generateSectionItems(
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
            'landscape', 2, 1.2, 0, 0,
            items,
            null,
            COMMON.COPYRIGHT
        );
    }

    /**
     * 콜백형식으로 이벤트 등록한것을 뷰로부터 넘겨받음
     */
    async presentOpenPost(type, section_name, key, value) {
        const data = await this.presentLifelog(
            this._BASE_PATH + key + '/' + value.contentUrl
        );

        const element = this.createlifelogItemDetail(type);
        const lifelog_viewer_item_detail_el = document.getElementById('lifelog-post-list-all-viewer')
            ?.querySelector('.lifelog-viewer-item-detail');
        
        if(lifelog_viewer_item_detail_el && type!=='curation-post') {
            element.appendChild(Templates.createContentPanel('lifelog-section-item-panel', data));

            const section_item_panel = lifelog_viewer_item_detail_el.querySelector('.lifelog-section-item-panel');

            for (const photo of section_item_panel.querySelectorAll('.lifelog-photo-medium')) {                
                photo.style.height = lifelog_viewer_item_detail_el.clientHeight + 'px';
                SiteLibrary.syncPhotoHeight(lifelog_viewer_item_detail_el, photo, 0);
            }            
        } else {
            Templates.openPost(
                value.id,
                section_name,
                this._ICON_PATH,
                value.tags.map(tag => '#' + tag).join(" · "),
                value.orientation, 1, 1.01, 0.8, 1.3,
                null, 
                data, 
                COMMON.COPYRIGHT
            );
            
            const viewer_el = document.getElementById(value.id);
            const content_area_el = viewer_el.querySelector('#content-area');
            content_area_el.style.overflow = 'hidden';
            content_area_el.querySelector('.content-panel').style.overflowY = 'auto';

            for (const photo of content_area_el.querySelectorAll('.lifelog-photo-medium')) {
                if (taskbar.taskBarElement.dataset.column > 1) {
                    SiteLibrary.syncPhotoHeight(content_area_el, photo, SiteLibrary.remToPx(3));
                } else {
                    this.syncPhotoWidth(content_area_el, photo);
                }
            }            
        }        
    }

    createlifelogItemDetail(type) {
        let lifelog_viewer_item = document.getElementById('lifelog-post-list-all-viewer')
                            ?.querySelector('.lifelog-viewer-item-detail');

        if(lifelog_viewer_item && type!=='curation-post') {
            lifelog_viewer_item.innerHTML='';
            lifelog_viewer_item.scrollTop = 0;
        } else {
            lifelog_viewer_item = document.createElement('div');
            lifelog_viewer_item.className = 'lifelog-viewer-item-detail';
        }

        return lifelog_viewer_item;
    }

    /**
     * Lifelog 가져와서 넘겨줌 
     * 서비스 클래스가 정리되면 서비스로 이동하는 것을 권장함.
     */
    async presentLifelog(content_url) {
        return await SiteLibrary.loadText(content_url);
    }

    syncPhotoWidth(parent_el, target_el) {
        const resizePhoto = () => {
            requestAnimationFrame(() => {
                const width = parent_el.clientWidth;
                target_el.style.width = `${width}px`;
            });
        };

        resizePhoto();

        const observer = new ResizeObserver(resizePhoto);
        observer.observe(parent_el);
    }

}