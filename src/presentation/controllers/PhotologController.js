'use strict';

import { SiteLibrary } from "../../modules/common/SiteLibrary.js";
import { Templates } from "../../modules/site/Templates.js";
import { COMMON } from "../../modules/common/Constants.js";
import { taskbar } from "../../modules/taskbar/TaskBar.js";

export class PhotologController {
    constructor(MainService, BlogService, View) {
        this.curation_service = MainService;
        this.original_service = BlogService;;
        this.section_view = View;

        this._BASE_PATH = "/assets/data/blog/photolog/";
        this._ICON_PATH = "/assets/icons/photographer.png";
        this._SECTION_NAME = "photolog";

        this.initialize();
    }
   
    async initialize() {}

    /**
     * Photolog 섹션 블록을 표현한다.
     * 섹션 블록은 큐레이션 data를 활용하므로 curation_service를 활용한다.
     */
    async displaySection() {
        const CurationDTO = await this.curation_service.getPhotolog();
        
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
        const data = await this.original_service.getPhotolog();

        let items;
        if (taskbar.taskBarElement.dataset.column > 2) {
            items = this.section_view.generatePhotoViewer(
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
            config.photologListViewerId,
            config.typeName,
            config.sectionHeaderIcon,
            config.photologSectionListName,
            'landscape', 1.5, 0.6, 0, 0,
            items,
            null,
            COMMON.COPYRIGHT
        );
    }

     /**
     * 콜백형식으로 이벤트 등록한것을 뷰로부터 넘겨받음
     */
    async presentOpenPost(type, section_name, key, value) {
        const data = await this.presentPhotologPhotos(
            this._BASE_PATH + key + '/' + value.contentUrl
        );

        const photolog_item_detail_el = this.createPhotologItemDetail(type, value);

        const photo_container = document.createElement('div');
        photo_container.className = 'photo-container';
        photo_container.innerHTML = data;

        photolog_item_detail_el.appendChild(photo_container);

        const end_el = document.createElement('div');
        end_el.className = 'photolog-end-caption';
        end_el.textContent = '끝.';

        photolog_item_detail_el.appendChild(end_el);

        const viewer_el = document.getElementById('photolog-post-list-all-viewer');
        
        if(viewer_el?.querySelector('.photolog-viewer-item-detail') && type!=='curation-post') {
            const caption_el = photolog_item_detail_el.querySelector('.photolog-item-caption');

            this.generateMouseWheelEvent(photolog_item_detail_el);
            this.syncPhotologCaption(photolog_item_detail_el, caption_el);
            this.syncPhotologCaption(photolog_item_detail_el, end_el);
        } else {
            Templates.openPost(
                value.id,
                section_name,
                this._ICON_PATH,
                value.title,
                value.orientation, 1.25, 0.6, 0, 0,
                null,
                photolog_item_detail_el,       
                COMMON.COPYRIGHT  
            );

            const el = document.getElementById(value.id);
            el.className = section_name + '-' + 'curation' + '-' + 'viewer';

            const content_panel_el = el.querySelector('.content-panel');
            const caption_el = content_panel_el.querySelector('.photolog-item-caption');

            this.generateMouseWheelEvent(content_panel_el);
            this.syncPhotologCaption(content_panel_el, caption_el);
            this.syncPhotologCaption(content_panel_el, end_el);
        }
    }

    generateMouseWheelEvent(element) {       
        if (element.dataset.wheelRegistered !== 'true') {
            element.addEventListener('wheel', (e) => {
                if (e.deltaY !== 0) {
                    element.scrollLeft += e.deltaY / 3;
                    e.preventDefault();
                }
            }, { passive: false });

            element.dataset.wheelRegistered = 'true';
        }
    }

    createPhotologItemDetail(type, data) {
        let photolog_viewer_item = document.getElementById('photolog-post-list-all-viewer')
                            ?.querySelector('.photolog-viewer-item-detail');

        if(photolog_viewer_item && type!=='curation-post') {
            photolog_viewer_item.innerHTML='';
            photolog_viewer_item.scrollTop = 0;
        } else {
            photolog_viewer_item = document.createElement('div');
            photolog_viewer_item.className = 'photolog-viewer-item-detail';
        }

        const photolog_item_caption = document.createElement('div');
        photolog_item_caption.className = 'photolog-item-caption';

        photolog_item_caption.appendChild(
            Templates.createContentPanel('title', data.title)
        );

        photolog_item_caption.appendChild(
            Templates.createContentPanel(
                'meta', 
                "&#128247;&nbsp" + data.date + " · " + data.location
            )
        );
        
        photolog_item_caption.appendChild(
            Templates.createContentPanel('tags', data.tags.map(tag => '#' + tag).join(" · "))
        );

        photolog_item_caption.appendChild(
            Templates.createContentPanel('description', data.description)
        );

        photolog_item_caption.appendChild(
            Templates.createContentPanel('photolog-caption-right-arrow', '&#8594;')
        );

        photolog_viewer_item.appendChild(photolog_item_caption);

        return photolog_viewer_item;
    }

    /**
     * Photolog 사진을 가져와서 넘겨줌 
     * 서비스 클래스가 정리되면 서비스로 이동하는 것을 권장함.
     */
    async presentPhotologPhotos(content_url) {
        return await SiteLibrary.loadText(content_url);
    }

    initializePhotoContainer(element, parent, offset) {
        const photo_container_el = element.querySelector('.photo-container');
        const photo_container_parent = photo_container_el.closest(parent);

        if (parseInt(taskbar.taskBarElement.dataset.column, 10) > 2) {
            for (const photo of photo_container_el.querySelectorAll('.photolog-photo')) {
                SiteLibrary.syncPhotoHeight(photo_container_parent, photo, offset);
            }
        } else {
            for (const photo of photo_container_el.querySelectorAll('.photolog-photo')) {
                SiteLibrary.syncPhotoWidth(photo_container_parent, photo, offset);
            }
        }
    }

    syncPhotologCaption(parent_el, target_el) {
        const resizeCaption = () => {
            requestAnimationFrame(() => {
                const width = parent_el.clientWidth;
                target_el.style.width = `${width}px`;
            });
        };

        resizeCaption();

        const observer = new ResizeObserver(resizeCaption);
        observer.observe(parent_el);
    }
}