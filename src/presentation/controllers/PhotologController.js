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
        const OriginalDTO = await this.original_service.getPhotolog();
        const CurationDTO = await this.curation_service.getPhotolog();
        
        this.section_view.setOriginalDTO(OriginalDTO);
        this.section_view.setCurationDTO(CurationDTO);

        this.section_view.setPostClickHandler(
            (type, section_name, key, value) => 
                this.presentOpenPost(type, section_name, key, value)
        );

        this.section_view.setSectionHeaderClickHandler(
            (config) => 
                this.presentSectionHeaderContent(config)
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
            'landscape', 1.2, 0.75, 0, 0,
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

        const photolog_item_detail_el = this.createPhotologItemDetail(value);

        const photo_container = document.createElement('div');
        photo_container.className = 'photo-container';
        photo_container.innerHTML = data;

        if(document.getElementById('photolog-post-list-all-viewer')
            ?.querySelector('.photolog-viewer-item-detail') && type!=='curation-post') {
            photolog_item_detail_el.appendChild(photo_container);            
            this.initializePhotoContainer('photolog-viewer', '.photolog-viewer-item-detail');
        } else {
            Templates.openPost(
                value.id,
                section_name,
                this._ICON_PATH,
                value.title,
                value.orientation, 1.1, 0.7, 0, 0,
                photolog_item_detail_el,
                photo_container,       
                COMMON.COPYRIGHT  
            );

            this.initializePhotoContainer(value.id, '#content-area');
        }        
    }

    createPhotologItemDetail(data) {
        let photolog_viewer_item = document.getElementById('photolog-post-list-all-viewer')
                            ?.querySelector('.photolog-viewer-item-detail');

        if(photolog_viewer_item) {
            photolog_viewer_item.innerHTML='';
            photolog_viewer_item.scrollTop = 0;
        } else {
            photolog_viewer_item = document.createElement('div');
            photolog_viewer_item.className = 'photolog-viewer-item-detail';
        }

        photolog_viewer_item.appendChild(
            Templates.createContentPanel('title', data.title)
        );

        photolog_viewer_item.appendChild(
            Templates.createContentPanel(
                'meta', 
                "&#128247;&nbsp" + data.date + " · " + data.location
            )
        );
        
        photolog_viewer_item.appendChild(
            Templates.createContentPanel('tags', data.tags.map(tag => '#' + tag).join(" · "))
        );

        photolog_viewer_item.appendChild(
            Templates.createContentPanel('description', data.description)
        );

        return photolog_viewer_item;
    }

    /**
     * Photolog 사진을 가져와서 넘겨줌 
     * 서비스 클래스가 정리되면 서비스로 이동하는 것을 권장함.
     */
    async presentPhotologPhotos(content_url) {
        return await SiteLibrary.loadText(content_url);
    }

    initializePhotoContainer(id, parent) {
        const photo_container_el = document.getElementById(id).querySelector('.photo-container');
        const photo_container_parent = photo_container_el.closest(parent);

        if (taskbar.taskBarElement.dataset.column > 2) {
            photo_container_el.style.height =
            `${photo_container_parent.clientHeight}px`;

            const observer = new ResizeObserver(() => {
                requestAnimationFrame(() => {
                    photo_container_el.style.height =
                        `${photo_container_parent.clientHeight}px`;
                });
            });

            observer.observe(photo_container_parent);
        }

        this.generatePhotoScrollEvent(photo_container_parent, photo_container_el);
    }



    generatePhotoScrollEvent(parent_el, target_el) {
        parent_el.addEventListener('wheel', (event) => {
            passive: false;

            const atBottom =
                parent_el.scrollTop + parent_el.clientHeight >=
                parent_el.scrollHeight - 1;

            const atLeft =
                target_el.scrollLeft <= 0;

            const atRight =
                target_el.scrollLeft + target_el.clientWidth >=
                target_el.scrollWidth - 1;

            // 부모가 맨 아래이고, 아래로 스크롤
            if (atBottom && event.deltaY > 0 && !atRight) {
                target_el.scrollLeft += event.deltaY;
                event.preventDefault();
            }

            // 부모가 맨 아래이고, 위로 스크롤
            else if (atBottom && event.deltaY < 0) {
                // 사진이 아직 왼쪽으로 갈 수 있음
                if (!atLeft) {
                    target_el.scrollLeft += event.deltaY;
                    event.preventDefault();
                // 사진이 이미 맨 왼쪽이면 부모를 위로
                } else {
                    parent_el.scrollTop += event.deltaY;
                    event.preventDefault();
                }
            }
        });
    }
}