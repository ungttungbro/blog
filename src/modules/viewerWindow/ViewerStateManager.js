'use strict';

import { SiteLibrary } from "../common/SiteLibrary.js";

export class ViewerStateManager {
    static state = new Map(); 

    static set(groupKey, key, value) {
        if (!this.state.has(groupKey)) {
            this.state.set(groupKey, new Map());
        }
        this.state.get(groupKey).set(key, value);
    }

    static setGroup(groupKey, stateObject) {
        for (const [key, value] of Object.entries(stateObject)) {
            this.set(groupKey, key, value);
    }}

    static get(groupKey, key) {
        if (!this.state.has(groupKey)) return undefined;
        return this.state.get(groupKey).get(key);
    }

    static has(groupKey) {
        if (!this.state.has(groupKey)) return false;
        return this.state.get(groupKey).has(key);
    }

    static removeGroup(groupKey) {
        if (!this.state.has(groupKey)) return;        
            this.state.delete(groupKey);
    }

    static removeItem(groupKey, key) {
        if (!this.state.has(groupKey)) return;

        const innerMap = this.state.get(groupKey);
        innerMap.delete(key);

        if (innerMap.size === 0) {
            this.state.delete(groupKey);
        }
    }

    static getGroup(groupKey) {
        return this.state.get(groupKey) ?? new Map();
    }

    static clearGroup(groupKey) {
        this.state.delete(groupKey);
    }

    static clearAll() {
        this.state.clear();
    }

    static stateLog(element) {
        const snapshot = {
            ['group']: element.dataset.group,
            ['className']: element.className,
            ['width']: element.getBoundingClientRect().width,
            ['height']: element.getBoundingClientRect().height,            
            ['visibility']: getComputedStyle(element).visibility,
            ['clientRect']: element.getBoundingClientRect(),
            ['zIndex'] : getComputedStyle(element).zIndex
        };

        this.setGroup(element.id, snapshot);
    }

    static maxZIndex() {
        let max = 0;
        for (const [key] of this.state) {
            const zIndex = this.get(key,'zIndex');
            if (zIndex && !isNaN(zIndex)) {
                max = Math.max(max, zIndex);
            }
        }
        
        return max;
    }

    static bringToFront(element) {
        let isOverlap = false;

        for (const [key, value] of this.state) {
            if (!value.get('clientRect') || key === element.id) continue;

            if (SiteLibrary.isRectOverlap(element.getBoundingClientRect(), value.get('clientRect'))) {
                if (value.get('visibility') === 'visible'){
                    isOverlap = true;
                    break;
                }
            }
        }

        if (isOverlap && (element.style.zIndex < this.maxZIndex())) {
            element.style.zIndex = this.maxZIndex() + 1;

            if (getComputedStyle(element).visibility === 'hidden') {
                SiteLibrary.elementVisibility(element.id);
            }                
        } else {
            SiteLibrary.elementVisibility(element.id);           
        }

        this.stateLog(element);
    }

    static elementVisibility(element) {
        if (element) {
            if (element.style.visibility == 'hidden') {
                element.style.visibility = 'visible';
            } else {
                element.style.visibility = 'hidden';
            }
        }
    }

    static toggleElementMaximize(element, offset_element_id) {
        if (element.isDragging) return;

        const isMaximized = element.classList.contains('is-maximized');

        const elementRect = element.getBoundingClientRect();
        const targetRect = document.getElementById(offset_element_id).getBoundingClientRect();
        const viewportHeight = window.visualViewport?.height ?? window.innerHeight;

        const targetTop = targetRect.bottom;
        const targetLeft = 0;
        const targetWidth = window.innerWidth;
        const targetHeight = viewportHeight - targetRect.bottom;

        // 현재 transform에서 translate 값 추출
        const style = window.getComputedStyle(element);
        const matrix = new DOMMatrixReadOnly(style.transform);
        const currentTranslateX = matrix.m41;
        const currentTranslateY = matrix.m42;

        if (isMaximized) {
            const prev = element._prevState;

            element.classList.remove('is-maximized');

            element.style.width = prev.width + 'px';
            element.style.height = prev.height + 'px';

            element.style.transform =
                `translate(${prev.translateX}px, ${prev.translateY}px)`;

            element.style.borderRadius = '0.5rem';
        } else {
            element._prevState = {
                width: element.offsetWidth,
                height: element.offsetHeight,
                translateX: currentTranslateX,
                translateY: currentTranslateY
            };

            const deltaX = targetLeft - elementRect.left;
            const deltaY = targetTop - elementRect.top;

            const newTranslateX = currentTranslateX + deltaX;
            const newTranslateY = currentTranslateY + deltaY;

            element.classList.add('is-maximized');

            // +1의 이유는 1px이 비는 문제가 발생하여 임의 조정함 (scroll시) 추후 개선 요망
            element.style.transform =
                `translate(${newTranslateX}px, ${newTranslateY - 1}px)`;

            element.style.width = targetWidth + 'px';
            element.style.height = targetHeight + 1 + 'px';

            element.style.borderRadius = '0';
        }
    }
}