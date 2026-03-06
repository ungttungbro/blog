'use strict';

import { ViewerStateManager } from "./ViewerStateManager.js";
import { ViewerWindowProcessRegistry } from "./ViewerWindowProcessRegistry.js";

const CONSTANTS = Object.freeze({
    TITLE_ICON_TYPE: 'small-icon',
    CLOSE_BUTTON_ICON_PATH: './assets/icons/close.png',
    MAXIMIZE_BUTTON_ICON_PATH: './assets/icons/screen.png',
    MINIMIZE_BUTTON_ICON_PATH: './assets/icons/minimize.png',
    WINDOW_BUTTON_NAME: 'window_button'
});

export class ViewerWindow {
    constructor () {
        this.targetId = null;
        this.id = null;
        this.className = null;        
        this.windowElement = null;
        this.isMaximized = false;
        this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    show() {
        const is_viewer = document.querySelector(`#${CSS.escape(this.id)}`);
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
        const icon = this.createImgElement(CONSTANTS.TITLE_ICON_TYPE, '',  this.titleIconPath, 'viewer title icon');
        const title_figure = this.createImgCaption(icon, null, this.titleText);
        title_figure.style.float = 'left';        

        return title_figure;
    }

    createWindowButtons() {
        const window_buttons = document.createElement('div');
        window_buttons.id = 'window_button_container';

        const close_button = this.createImgElement(
            CONSTANTS.WINDOW_BUTTON_NAME, 
            'viewer-close-button', 
            CONSTANTS.CLOSE_BUTTON_ICON_PATH, 
            'close button'
        );

        const maximize_button = this.createImgElement(
            CONSTANTS.WINDOW_BUTTON_NAME,
            'viewer-maximize-button', 
            CONSTANTS.MAXIMIZE_BUTTON_ICON_PATH, 
            'maximize button'
        );

        const minimize_button = this.createImgElement(
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

        window_element.style.zIndex = ViewerStateManager.maxZIndex() + 1; 

        minimize_button.addEventListener('click', (e) => {
            e.stopPropagation();
            ViewerStateManager.elementVisibility(window_element);            
            ViewerStateManager.stateLog(window_element);
        });

        maximize_button.addEventListener('click', (e) => {
            e.stopPropagation();

            ViewerStateManager.toggleElementMaximize(window_element, 'taskbar');
            if (this.isMaximized) this.isMaximized = false;
            else this.isMaximized = true;
 
            ViewerStateManager.stateLog(window_element);
        });

        close_button.addEventListener('click', (e) => {
            e.stopPropagation();
            
            ViewerWindowProcessRegistry.get('unmount', 'function')?.(
                window_element.dataset.group, 
                this.targetId,
                this.id
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
            let newTranslateX = this.startTranslateX;
            let newTranslateY = this.startTranslateY;

            // 오른쪽(e) resize
            if (this.resizeDirection.includes('e')) {
                newWidth = this.startWidth + dx;
            }

            // 아래(s) resize
            if (this.resizeDirection.includes('s')) {
                newHeight = this.startHeight + dy;
            }

            // 왼쪽(w) resize
            if (this.resizeDirection.includes('w')) {
                newWidth = this.startWidth - dx;
                newTranslateX = this.startTranslateX + dx;
            }

            // 위쪽(n) resize
            if (this.resizeDirection.includes('n')) {
                newHeight = this.startHeight - dy;
                newTranslateY = this.startTranslateY + dy;
            }

            this.windowElement.style.width  = newWidth + 'px';
            this.windowElement.style.height = newHeight + 'px';
            this.windowElement.style.transform = `translate(${newTranslateX}px, ${newTranslateY}px)`;
        };

        this.onResizeEnd = () => {
            this.isResizing = false;

            const style = window.getComputedStyle(this.windowElement);
            const matrix = new DOMMatrixReadOnly(style.transform || 'matrix(1,0,0,1,0,0)');

            // ← 여기서 transform 기준 누적 좌표 갱신
            this.startTranslateX = matrix.m41;
            this.startTranslateY = matrix.m42;

            document.removeEventListener('pointermove', this.onResizeMove);
            document.removeEventListener('pointerup', this.onResizeEnd);

            ViewerStateManager.stateLog(this.windowElement);
        };

        this.windowElement.addEventListener('pointerdown', (e) => {
            if (this.isTouchDevice) return;

            const direction = resizeDirection(e);
            if (!direction) return;

            const rect = this.windowElement.getBoundingClientRect();

            // 현재 transform 값 읽어오기 (없으면 0)
            const style = window.getComputedStyle(this.windowElement);
            const matrix = new DOMMatrixReadOnly(style.transform);
            this.startTranslateX = matrix.m41 || 0;
            this.startTranslateY = matrix.m42 || 0;

            this.isResizing = true;
            this.resizeDirection = direction;

            this.resizeStartX = e.clientX;
            this.resizeStartY = e.clientY;

            this.startWidth  = rect.width;
            this.startHeight = rect.height;

            document.addEventListener('pointermove', this.onResizeMove);
            document.addEventListener('pointerup', this.onResizeEnd);
        });

        this.windowElement.addEventListener('pointermove', (e) => {            
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

        title_bar.addEventListener('dblclick', () => {
            if (!title_bar.isDragging) {
                ViewerStateManager.toggleElementMaximize(this.windowElement, 'taskbar');
                if (this.isMaximized) this.isMaximized = false;
                else this.isMaximized = true;
            }
        });

        title_bar.addEventListener('pointerdown', (e) => {
            if (this.isMaximized) return;
            if (e.target.closest('.window_button')) return;

            const window_element = this.windowElement;
            if (window_element.classList.contains(window_element.id)) return;
            
            window_element.style.zIndex = ViewerStateManager.maxZIndex() + 1; 
            ViewerStateManager.stateLog(window_element);

            const style = window.getComputedStyle(window_element);
            const matrix = new DOMMatrixReadOnly(style.transform || 'matrix(1,0,0,1,0,0)');

            drag_state = {
                pointerId: e.pointerId,
                startX: e.clientX,
                startY: e.clientY,
                startTranslateX: matrix.m41, // transform 기준 X
                startTranslateY: matrix.m42, // transform 기준 Y
                dragging: false
            };

            // pointer capture
            title_bar.setPointerCapture(e.pointerId);
        });

        document.addEventListener('pointermove', (e) => {
            if (!drag_state || e.pointerId !== drag_state.pointerId) return;

            const window_element = this.windowElement;

            const dx = e.clientX - drag_state.startX;
            const dy = e.clientY - drag_state.startY;

            window_element.style.transform = 
                    `translate(${drag_state.startTranslateX + dx}px, ${drag_state.startTranslateY + dy}px)`;
        });

        document.addEventListener('pointerup', (e) => {
            if (!drag_state || e.pointerId !== drag_state.pointerId) return;

            const window_element = this.windowElement;

            const deltaX = e.clientX - drag_state.startX;
            const deltaY = e.clientY - drag_state.startY;

            // 실제 위치 확정
            window_element.style.left = (drag_state.initialLeft + deltaX) + 'px';
            window_element.style.top  = (drag_state.initialTop + deltaY) + 'px';

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

    configureWindow(configure, header_contents, main_contents, footer_contents) {
        this.id = configure.element.elementId;
        this.className = configure.element.className;

        this.width = configure.layout.width;
        this.height = configure.layout.height;
        this.left = configure.layout.left;
        this.top = configure.layout.top;        
        
        this.contentClassName = configure.meta.contentType;
        this.titleIconPath = configure.meta.titleIconPath;
        this.titleText = configure.meta.titleText;

        this.headerContents = header_contents;
        this.mainContents = main_contents;
        this.footerContents = footer_contents;
    }

    createImgElement(class_name, id, src, alt) {
        const img = document.createElement('img');
        
        img.className = class_name;
        img.id = id;
        img.src =  src;
        img.alt = alt;
        
        return img;
    }

    createImgCaption(image_element, caption_id, caption_text) {
        const caption = document.createElement('figcaption');
        caption.id = caption_id;
        caption.innerHTML = '&nbsp;' + caption_text;

        const figure = document.createElement('figure');
        figure.appendChild(image_element);
        figure.appendChild(caption);

        return figure;
    }
}