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
            'landscape', 1.25, 0.7, 0, 0,
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

        if(document.getElementById('photolog-post-list-all-viewer')
            ?.querySelector('.photolog-viewer-item-detail') && type!=='curation-post') {
            photolog_item_detail_el.appendChild(photo_container);            
            this.initializePhotoContainer(photolog_item_detail_el, '.photolog-viewer-item-detail', 0);
        } else {
            const frag = document.createDocumentFragment();
            frag.appendChild(photolog_item_detail_el);
            frag.appendChild(photo_container);

            Templates.openPost(
                value.id,
                section_name,
                this._ICON_PATH,
                value.title,
                value.orientation, 1.1, 0.7, 0, 0,
                null,
                frag,       
                COMMON.COPYRIGHT  
            );

            const el = document.getElementById(value.id);
            el.className = section_name + '-' + 'curation' + '-' + 'viewer';

            this.initializePhotoContainer(el, '.content-panel', 0);
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

    initializePhotoContainer(element, parent, offset) {
        const photo_container_el = element.querySelector('.photo-container');
        const photo_container_parent = photo_container_el.closest(parent);

        if (parseInt(taskbar.taskBarElement.dataset.column, 10) > 2) {
            for (const photo of photo_container_el.querySelectorAll('.photolog-photo')) {
                SiteLibrary.syncPhotoHeight(photo_container_parent, photo, offset);
            }
        } else {
            for (const photo of photo_container_el.querySelectorAll('.photolog-photo')) {
                this.syncPhotoWidth(photo_container_parent, photo, offset);
            }
        }

        this.generatePhotoScrollEvent(photo_container_parent, photo_container_el);
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

    generatePhotoScrollEvent(parent_el, target_el) {
        let isHorizontalScrollActive = false;

        parent_el.addEventListener('wheel', (event) => {
            const maxScrollTop =
                parent_el.scrollHeight - parent_el.clientHeight;

            const maxScrollLeft =
                target_el.scrollWidth - target_el.clientWidth;

            const atBottom =
                parent_el.scrollTop >= maxScrollTop - 2;

            const atLeft =
                target_el.scrollLeft <= 1;

            const atRight =
                target_el.scrollLeft >= maxScrollLeft - 1;

            // 가로 스크롤이 활성화된 상태
            if (isHorizontalScrollActive) {

                // 사진의 왼쪽 끝에서 위로 스크롤하면 부모로 복귀
                if (atLeft && event.deltaY < 0) {
                    isHorizontalScrollActive = false;
                    return;
                }

                // 부모를 최하단에 고정
                event.preventDefault();
                
                parent_el.scrollTop =
                    parent_el.scrollHeight - parent_el.clientHeight;

                // 사진의 가로 스크롤 처리
                target_el.scrollLeft += event.deltaY;
                return;
            }

            // 부모가 하단에 도달하기 전에는 일반 세로 스크롤
            if (!atBottom) return;

            // 하단에서 아래로 스크롤하면 가로 스크롤 활성화
            if (event.deltaY > 0 && !atRight) {
                isHorizontalScrollActive = true;
                event.preventDefault();
                target_el.scrollLeft += event.deltaY;
                return;
            }

            // 사진이 왼쪽 끝이 아니면 위로 스크롤해도 가로 이동
            if (event.deltaY < 0 && !atLeft) {
                isHorizontalScrollActive = true;
                event.preventDefault();
                target_el.scrollLeft += event.deltaY;
            }
        }, { passive: false });
    }
}