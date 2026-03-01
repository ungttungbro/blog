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
}