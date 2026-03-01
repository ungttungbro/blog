'use strict';

export class TaskStateManager {
    static taskGroupMap = new Map();

    // 그룹 생성
    static createGroup(groupKey) {
        if (!this.taskGroupMap.has(groupKey)) {
            this.taskGroupMap.set(groupKey, new Map());
        }
    }

    // 태스크 추가
    static addTask(groupKey, element, target_id) {
        this.createGroup(groupKey);

        const group = this.taskGroupMap.get(groupKey);

        group.set(element.id, {
            element,
            className: element.className,
            targetId: target_id
        });
    }

    // 태스크 제거
    static removeTask(groupKey, taskId) {
        const group = this.taskGroupMap.get(groupKey);
        if (!group) return;

        group.delete(taskId);

        // 비어 있으면 그룹도 제거
        if (group.size === 0) {
            this.taskGroupMap.delete(groupKey);
        }
    }

    // 조회
    static getTask(groupKey, taskId) {
        return this.taskGroupMap.get(groupKey)?.get(taskId);
    }

    static getGroup(groupKey) {
        return this.taskGroupMap.get(groupKey) ?? new Map();
    }

    static getElementsSize() {
        return this.taskGroupMap.size;
    }

    static enforceSingle(class_name, element) {
        const group_map = this.taskGroupMap;

        for (const taskMap of group_map.values()) {
            for (const taskData of taskMap.values()) {
                const mounted_element = document.getElementById(taskData.targetId);
                mounted_element.querySelector('.title_bar').classList.remove(class_name);
            }
        }

        element.classList.add(class_name);
    }
    
}