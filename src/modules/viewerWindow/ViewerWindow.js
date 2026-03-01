'use strict';

import { SiteLibrary } from "../common/SiteLibrary.js";
import { ViewerStateManager } from "./ViewerStateManager.js";
import { ViewerWindowProcessRegistry } from "./ViewerWindowProcessRegistry.js";

const CONSTANTS = Object.freeze({
    TITLE_ICON_TYPE: 'medium-icon',
    CLOSE_BUTTON_ICON_PATH: './assets/icons/close.png',
    MAXIMIZE_BUTTON_ICON_PATH: './assets/icons/screen.png',
    MINIMIZE_BUTTON_ICON_PATH: './assets/icons/minimize.png',
    WINDOW_BUTTON_NAME: 'window_button'
});

export class ViewerWindow {
    constructor () {
        this.targetId = null;
        this.viewerId = null;        
        this.windowElement = null;
        this.isMaximized = false;
        this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    /*  this 멤버필드
        id, width, height, className, contentClassName, titleIconPath,
        titleText, headerContents, mainContents, footerContents
    */
    show() {
        this.viewerId = this.id;

        const is_viewer = document.querySelector(`#${CSS.escape(this.viewerId)}`);
        if (is_viewer) { return; }

        this.windowElement = this.createWindowElement();
        
        const title_bar = this.createTitleBar();
        this.windowElement.appendChild(title_bar);

        const contents = this.createContentArea();
        this.windowElement.appendChild(contents);

        document.body.appendChild(this.windowElement);

        this.dragWindow();
        this.resizeWindow();

        ViewerWindowProcessRegistry.get('enforceSingle', 'function')?.(this.windowElement.querySelector('.title_bar'));
        ViewerStateManager.stateLog(this.windowElement);
    }

    createWindowElement() {
        const element = document.createElement('div');

        element.id = this.id;
        element.className = this.className;
        element.style.width = this.width;
        element.style.height = this.height;
        element.style.position = 'fixed';
        element.style.transform = 'none';
        element.style.left = this.left;
        element.style.top = this.top;
        element.style.zIndex = ViewerStateManager.maxZIndex() + 1;

        element.addEventListener('click', (e) => {
            if (e.target !== e.currentTarget) return;

            element.style.zIndex = ViewerStateManager.maxZIndex() + 1;
            ViewerStateManager.stateLog(element);
        });
        
        element.addEventListener('pointerenter', () => {
            ViewerWindowProcessRegistry.get('enforceSingle', 'function')?.(element.querySelector('.title_bar'));
        });

        return element;
    }

    createContentArea() {
        const contents = document.createElement('div');
        contents.id = 'content_area';

        if(this.headerContents !== null) {
            const header_panel = document.createElement('div'); header_panel.className = 'header_panel';
            header_panel.appendChild(this.headerContents);
            contents.appendChild(header_panel); 
        }      
               
        if (this.mainContents !== null) {
            const contents_panel = document.createElement('div'); contents_panel.className = 'content_panel';
            contents_panel.appendChild(this.mainContents);
            contents.appendChild(contents_panel);
        } 

        if (this.footerContents !== null) {
            const footer_panel = document.createElement('div'); footer_panel.className = 'footer_panel';
            footer_panel.appendChild(this.footerContents);
            contents.appendChild(footer_panel); 
        } 
        
        return contents;
    }

    createTitleBar() {
        const title_bar = document.createElement('div');
        title_bar.className = 'title_bar';
        
        title_bar.appendChild(this.createTitleIcon());
        title_bar.appendChild(this.createWindowButtons());

        title_bar.addEventListener('pointerdown', e => { title_bar.style.cursor = 'move'; });
        title_bar.addEventListener('pointerup', e => { title_bar.style.cursor = ''; });

        return title_bar;
    }

    createTitleIcon() {
        const icon = document.createElement('img');
        icon.className = 'small-icon';
        icon.src =  this.titleIconPath;

        const title_figure = SiteLibrary.createImgCaption(icon, null, SiteLibrary.truncateText(this.titleText, 45));
        title_figure.style.float = 'left';        

        return title_figure;
    }

    createWindowButtons() {
        const window_buttons = document.createElement('div');
        window_buttons.id = 'window_button_container';

        const close_button = SiteLibrary.createImgElement(
            CONSTANTS.WINDOW_BUTTON_NAME, 
            '', 
            CONSTANTS.CLOSE_BUTTON_ICON_PATH, 
            'close button'
        );

        const maximize_button = SiteLibrary.createImgElement(
            CONSTANTS.WINDOW_BUTTON_NAME,
            'viewer-maximize-button', 
            CONSTANTS.MAXIMIZE_BUTTON_ICON_PATH, 
            'maximize button'
        );

        const minimize_button = SiteLibrary.createImgElement(
            CONSTANTS.WINDOW_BUTTON_NAME, 
            'viewer-minimize-button', 
            CONSTANTS.MINIMIZE_BUTTON_ICON_PATH, 
            'minimize button'
        );

        this.generateWindowsButtonsEvent(minimize_button, maximize_button, close_button);
        
        window_buttons.appendChild(minimize_button);
        window_buttons.appendChild(maximize_button);
        window_buttons.appendChild(close_button);
        
        return window_buttons;
    }

    generateWindowsButtonsEvent(minimize_button, maximize_button, close_button) {
        const window_element = this.windowElement;

        minimize_button.addEventListener('click', e => {
            e.stopPropagation();
            SiteLibrary.elementVisibility(this.viewerId);

            window_element.style.zIndex = ViewerStateManager.maxZIndex() + 1; 
            ViewerStateManager.stateLog(window_element);
        });

        maximize_button.addEventListener('click', e => {
            e.stopPropagation();

            SiteLibrary.toggleElementMaximize(window_element, 'taskbar');
            if (this.isMaximized) this.isMaximized = false;
            else this.isMaximized = true;

            window_element.style.zIndex = ViewerStateManager.maxZIndex() + 1; 
            ViewerStateManager.stateLog(window_element);
        });

        close_button.addEventListener('click', e => {
            e.stopPropagation();
            
            ViewerWindowProcessRegistry.get('unmount', 'function')?.(
                window_element.dataset.group, 
                this.targetId,
                this.viewerId
            );

            if (e.state) { history.back(); }
        });
    }

    resizeWindow() {        
        const resizeDirection = (e) => {
            const EDGE = 8; // 모서리 감지 영역(px)

            const rect = this.windowElement.getBoundingClientRect();
            
            const left   = rect.left;
            const right  = rect.right;
            const top    = rect.top;
            const bottom = rect.bottom;

            const nearLeft   = Math.abs(e.clientX - left)   <= EDGE && e.clientY >= top && e.clientY <= bottom;
            const nearRight  = Math.abs(e.clientX - right)  <= EDGE && e.clientY >= top && e.clientY <= bottom;
            const nearTop    = Math.abs(e.clientY - top)    <= EDGE && e.clientX >= left && e.clientX <= right;
            const nearBottom = Math.abs(e.clientY - bottom) <= EDGE && e.clientX >= left && e.clientX <= right;

            let direction = null;
            if (nearRight && nearBottom) direction = 'se';
            else if (nearRight && nearTop) direction = 'ne';
            else if (nearLeft && nearBottom) direction = 'sw';
            else if (nearLeft && nearTop) direction = 'nw';
            else if (nearRight) direction = 'e';
            else if (nearLeft) direction = 'w';
            else if (nearBottom) direction = 's';
            else if (nearTop) direction = 'n';
            else direction = null;

            return direction;
        };

        this.onResizeMove = (e) => {
            if (!this.isResizing) return;

            const dx = e.clientX - this.resizeStartX;
            const dy = e.clientY - this.resizeStartY;

            let newWidth  = this.startWidth;
            let newHeight = this.startHeight;
            let newLeft   = this.startLeft;
            let newTop    = this.startTop;

            if (this.resizeDirection.includes('e')) {
                newWidth = this.startWidth + dx;
            }
            if (this.resizeDirection.includes('s')) {
                newHeight = this.startHeight + dy;
            }
            if (this.resizeDirection.includes('w')) {
                newWidth = this.startWidth - dx;
                newLeft  = this.startLeft + dx;
            }
            if (this.resizeDirection.includes('n')) {
                newHeight = this.startHeight - dy;
                newTop    = this.startTop + dy;
            }

            this.windowElement.style.width  = newWidth + 'px';
            this.windowElement.style.height = newHeight + 'px';
            this.windowElement.style.left = newLeft + 'px';
            this.windowElement.style.top = newTop + 'px';
        };

        this.onResizeEnd = () => {
            this.isResizing = false;

            this.beforeWidth = this.windowElement.style.width;
            this.beforeHeight = this.windowElement.style.height;

            document.removeEventListener('pointermove', this.onResizeMove);
            document.removeEventListener('pointerup', this.onResizeEnd);

            ViewerStateManager.stateLog(this.windowElement);
        };

        this.windowElement.addEventListener('pointerdown', e => {
            if (this.isTouchDevice) return; // 터치면 resize 무시

            const direction = resizeDirection(e);
            if (!direction) return;

            const rect = this.windowElement.getBoundingClientRect();

            this.isResizing = true;
            this.resizeDirection = direction;

            this.resizeStartX = e.clientX;
            this.resizeStartY = e.clientY;

            this.startWidth  = rect.width;
            this.startHeight = rect.height;
            this.startLeft   = rect.left;
            this.startTop    = rect.top;

            document.addEventListener('pointermove', this.onResizeMove);
            document.addEventListener('pointerup', this.onResizeEnd);
        });

        this.windowElement.addEventListener('pointermove', e => {            
            const direction = resizeDirection(e);
            const cursorMap = {
                e: 'e-resize',
                w: 'w-resize',
                n: 'n-resize',
                s: 's-resize',
                ne: 'ne-resize',
                nw: 'nw-resize',
                se: 'se-resize',
                sw: 'sw-resize'
            };

            if (cursorMap[direction]) {
                this.windowElement.style.cursor = cursorMap[direction];
            } else {
                this.windowElement.style.cursor = 'default';
            }                
        });
    }

    dragWindow() {
        const window_element = this.windowElement;
        const title_bar = window_element.querySelector('.title_bar');

        this.generateDragEvent(title_bar);
    }

    generateDragEvent(title_bar) {
        let drag_state = null;

        // 더블 클릭 최대/최소화
        title_bar.addEventListener('dblclick', e => {
            if (!title_bar.isDragging) {
                SiteLibrary.toggleElementMaximize(this.windowElement, 'taskbar');
                if (this.isMaximized) this.isMaximized = false;
                else this.isMaximized = true;
            }
        });

        // 드래그 시작
        title_bar.addEventListener('pointerdown', e => {
            if (this.isMaximized) return;
            if (e.target.closest('.window_button')) return;

            const window_element = this.windowElement;
            if (window_element.classList.contains(window_element.id)) return;
            
            window_element.style.zIndex = ViewerStateManager.maxZIndex() + 1; 
            ViewerStateManager.stateLog(window_element);

            const rect = window_element.getBoundingClientRect();

            drag_state = {
                pointerId: e.pointerId,
                startX: e.clientX,
                startY: e.clientY,
                offsetX: e.clientX - rect.left,
                offsetY: e.clientY - rect.top,
                dragging: false
            };
        });

        // 드래그 이동
        document.addEventListener('pointermove', e => {
            if (!drag_state || e.pointerId !== drag_state.pointerId) return;

            const dx = Math.abs(e.clientX - drag_state.startX);
            const dy = Math.abs(e.clientY - drag_state.startY);

            // 드래그 임계값
            if (!drag_state.dragging && (dx > 5 || dy > 5)) {
                drag_state.dragging = true;
                title_bar.isDragging = true;
                e.preventDefault();
            }

            if (!drag_state.dragging) return;

            const window_element = this.windowElement;
            window_element.style.left = (e.clientX - drag_state.offsetX) + 'px';
            window_element.style.top  = (e.clientY - drag_state.offsetY) + 'px';
        });

        // 드래그 종료
        document.addEventListener('pointerup', e => {
            if (!drag_state || e.pointerId !== drag_state.pointerId) return;

            this.windowElement.style.pointerEvents = 'auto';

            ViewerStateManager.stateLog(this.windowElement);
            
            title_bar.isDragging = false;
            drag_state = null;
        });

        document.addEventListener('pointercancel', () => {
            drag_state = null;
            title_bar.isDragging = false;
        });
    }


    configureWindow(
        id, width, height, top, left,
        class_name, content_name, 
        title_icon_path, title_text, 
        header_contents, main_contents, footer_contents
    ) {        
        this.id = id;
        this.width = width;
        this.height = height;
        this.top = top;
        this.left = left;
        this.className = class_name;
        this.contentClassName = content_name;
        this.titleIconPath = title_icon_path;
        this.titleText = title_text;
        this.headerContents = header_contents;
        this.mainContents = main_contents;
        this.footerContents = footer_contents;
    }
}