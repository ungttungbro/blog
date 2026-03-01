'use strict';

import { SiteLibrary } from "../common/SiteLibrary.js";
import { TaskStateManager } from "./TaskStateManager.js";
import { TaskBarProcessRegistry } from "./TaskBarProcessRegistry.js";

const TASKBAR_CONSTANTS = Object.freeze({
    TITLE_ICON_TYPE : 'medium-icon',
    CLOSE_BUTTON_ICON_PATH : './assets/icons/close.png',
    TASK_ITEM_CHAR_LIMIT : 18
});

export class TaskBar {
    async initialize(task_bar_element) {
        if (!task_bar_element)
            throw new Error('taskbar element required');

        this.taskBarElement = task_bar_element;
        this.taskItemsElement = document.createElement('div');
        this.taskItemsElement.id = 'task-items';
    }

    set groupTypeData(group_type_data) {
        this._groupTypeData = group_type_data;
    }

    get groupTypeData() {
        return this._groupTypeData;
    }

    createLayout(logo_button, screen_shade_button, theme_mode_button) {
        return new Promise(resolve => {
            this.taskBarElement.appendChild(logo_button);
            this.taskBarElement.appendChild(this.taskItemsElement);
            this.taskBarElement.appendChild(screen_shade_button);
            this.taskBarElement.appendChild(theme_mode_button);
            resolve();
        });
    }
    
    mount(group_type, taskbar_item_id, target_id, title_icon_path, title_text) {
        const task_item = this.createSingleTaskItem (
            group_type, 
            taskbar_item_id, 
            target_id, 
            title_icon_path, 
            title_text
        );

        TaskStateManager.addTask(group_type, task_item, target_id);

        const task_bar = this.taskItemsElement;
        const task_group = TaskStateManager.getGroup(group_type);
        const group_length = task_group.size;

        const task_group_root = this.createTaskGroup(
            group_type,
            task_group,
            title_icon_path
        );

        if (group_length === 1) { 
            task_bar.appendChild(task_item);
            return;
        }
        
        if (group_length === 2) {
            task_bar.appendChild(task_group_root);
            return;
        }
        
        const group_items = task_group_root.querySelector('.task-group-items');
        if (!group_items) return;

        group_items.appendChild(task_item);
    }

    unmount(task_bar_item_id, target_id) {
        const task_element = document.getElementById(task_bar_item_id);
        if (!task_element) return;

        TaskStateManager.removeTask(task_element.dataset.group, task_element.id);

        SiteLibrary.closeElement(task_element.id);        
        SiteLibrary.closeElement(target_id);
        
        const group_items = TaskStateManager.getGroup(task_element.dataset.group);
        const group_root = document.getElementById(task_element.dataset.group + '_task_group');

        if (group_root && group_items.size === 1) {
            this.taskItemsElement.appendChild(group_items.values().next().value.element);
            group_root.remove();
        }

        TaskBarProcessRegistry.get('unmount', 'function')?.();
    }

    createTaskGroup(group_type, task_group_items, title_icon_path) {
        let task_group = document.getElementById(group_type + '_task_group');

        if (task_group) return task_group;

        task_group = this.createTaskGroupRoot(
            group_type,
            group_type + '_task_group',
            title_icon_path,
            this.groupTypeData[group_type]?.label ?? ''
        );

        const group_items = this.createTaskGroupItems(task_group_items);
        task_group.appendChild(group_items);

        this.groupItemsEvent(task_group, group_items);

        return task_group;
    }

    createTaskGroupRoot(group_type, task_group_id, title_icon_path, title_text) {
        const element = document.createElement('div');
        element.id = task_group_id;
        element.className = 'task-bar-group';

        const title_img = SiteLibrary.createImgElement(TASKBAR_CONSTANTS.TITLE_ICON_TYPE, '', title_icon_path, '');
        const caption = SiteLibrary.createImgCaption(title_img, null, title_text);

        const close_button_icon_path = TASKBAR_CONSTANTS.CLOSE_BUTTON_ICON_PATH;
        const close_img = SiteLibrary.createImgElement('task-item-close', '', close_button_icon_path, '');

        close_img.addEventListener ('click', (e) => {
            e.stopPropagation();

            const group = TaskStateManager.getGroup(group_type);

            for (const task of group.values()) {
                this.unmount(task.element.id, task.targetId);
            }
        });

        element.appendChild(title_img);
        element.appendChild(caption);
        element.appendChild(close_img);

        return element;
    }

    createTaskGroupItems(task_group_items) {
        const group_items = document.createElement('div');
        group_items.className = 'task-group-items';

        for (const [key] of task_group_items) {
            group_items.appendChild(task_group_items.get(key).element);
        }

        return group_items;
    } 

    groupItemsEvent(task_group_item, group_items) {
        document.addEventListener('pointerdown', (e) => {
            if (!group_items.contains(e.target)) {
                group_items.style.visibility = 'hidden';
            }
        });

        task_group_item.addEventListener ('click', (e) => {
            e.stopPropagation();
            if (group_items.style.visibility === 'visible') {
                group_items.style.visibility = 'hidden';
            } else {
                group_items.style.visibility = 'visible';
            }            
        });
    }

    createSingleTaskItem(group_type, taskbar_item_id, target_id, title_icon_path, title_text) {
        const taskbar_item = this.createTaskBarItem (
            taskbar_item_id, 
            target_id, 
            title_icon_path, 
            SiteLibrary.truncateText(title_text, TASKBAR_CONSTANTS.TASK_ITEM_CHAR_LIMIT)
        );

        taskbar_item.dataset.group = group_type;

        return taskbar_item;
    }

    createTaskBarItem(taskbar_item_id, target_id, title_icon_path, title_text) {
        const element = document.createElement('div');
        element.id = taskbar_item_id;
        element.className = 'task-bar-item';

        element.addEventListener ('click', () => {
            TaskBarProcessRegistry.get('taskBarItemClick', 'function')?.(target_id);
        });
            
        const title_img = SiteLibrary.createImgElement(TASKBAR_CONSTANTS.TITLE_ICON_TYPE, '', title_icon_path, '');
        const caption = SiteLibrary.createImgCaption(title_img, null, title_text);

        const close_button_icon_path = TASKBAR_CONSTANTS.CLOSE_BUTTON_ICON_PATH;
        const close_img = SiteLibrary.createImgElement('task-item-close', '', close_button_icon_path, '');

        close_img.addEventListener ('click', (e) => {
            e.stopPropagation();

            this.unmount(element.id, target_id);

            TaskStateManager.removeTask(element.dataset.group, element.id);
            TaskBarProcessRegistry.get('taskBarItemCloseButtonClick', 'function')?.(target_id);
        });

        element.appendChild(caption);
        element.appendChild(close_img);
       
        return element;
    }

    teardownSingleItems(group_type) {
        const group = TaskStateManager.getGroup(group_type);
        if (!group) return;

        for (const task of group.values()) {
            if (task.element) {
                task.element.remove();
                task.element = null;
            }
        }
    }
}

export const taskbar = new TaskBar();