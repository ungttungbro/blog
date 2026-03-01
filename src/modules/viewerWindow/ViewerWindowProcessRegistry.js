'use strict';

export class ViewerWindowProcessRegistry {
  static registry = new Map(); // key: snapName, value: 함수

  // 스냅 등록
  static register(key, snapFn) {
    this.registry.set(key, snapFn);
  }

  // 스냅 존재 여부 확인
  static has(key) {
    return this.registry.has(key);
  }

  static get(key, property) {
    return this.registry.get(key)?.[property];
  }

  // 등록된 모든 프로세스 key 반환
  static getAllKeys() {
      return [...this.registry.keys()];
  }

  // 모든 프로세스 일괄 실행 (function 속성 기준)
  static runAll() {
      for (const key of this.getAllKeys()) {
          const fn = this.get(key, 'function');
          fn?.(); // 함수가 있으면 실행
      }
  }
}
