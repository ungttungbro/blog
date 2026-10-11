'use strict';

import { shell } from './modules/shell/Shell.js';

import { MainService } from './service/MainService.js';
import { BlogService } from './service/BlogService.js';

import { WritingsController } from './presentation/controllers/WritingsController.js';
import { LifelogController } from './presentation/controllers/LifelogController.js';
import { ArchiveController } from './presentation/controllers/ArchiveController.js';
import { ReflectionController } from './presentation/controllers/ReflectionController.js';
import { PhotologController } from './presentation/controllers/PhotologController.js';
import { DeepLinkController } from './presentation/controllers/DeepLinkController.js';

import { AboutSection } from './presentation/views/AboutSection.js';
import { LinksSection } from './presentation/views/LinksSection.js';
import { WritingsSection } from './presentation/views/WritingsSection.js';
import { LifelogSection } from './presentation/views/LifelogSection.js';
import { ArchiveSection } from './presentation/views/ArchiveSection.js';
import { ReflectionSection } from './presentation/views/ReflectionSection.js';
import { PhotologSection } from './presentation/views/PhotologSection.js';

export default class Main {
  constructor() {
    this.original_service = new BlogService();
    this.curation_service = new MainService();

    this.taskbar = document.getElementById('taskbar');
  }

  async initialize(){
    await Promise.all([
      this.original_service.initialize(),
      this.curation_service.initialize(),
      shell.initialize(this.taskbar)
    ]);    
  }

  async display() {
      this.about = new AboutSection(this.curation_service);
      this.links = new LinksSection(this.curation_service);
      this.writings = new WritingsController(this.curation_service, this.original_service, new WritingsSection);
      this.lifelog = new LifelogController(this.curation_service, this.original_service, new LifelogSection);
      this.archive = new ArchiveController(this.curation_service, this.original_service, new ArchiveSection);
      this.reflection = new ReflectionController(this.curation_service, this.original_service, new ReflectionSection);
      this.photolog = new PhotologController(this.curation_service, this.original_service, new PhotologSection);

      await Promise.all([
        this.about.show(),
        this.links.show(),
        this.writings.displaySection(),
        this.lifelog.displaySection(),
        this.archive.displaySection(),
        this.reflection.displaySection(),
        this.photolog.displaySection()
      ]);

      shell.initLayoutMemory();
      shell.updateLayout();
  }

  handleDeepLink() {
    const section_map = {
        writings: { element: new WritingsSection, icon: '/assets/icons/blog.png' },
        reflection: { element: new ReflectionSection, icon: '/assets/icons/reflection.png' },
        lifelog: { element: new LifelogSection, icon: '/assets/icons/lifelog.png' },
        archive: { element: new ArchiveSection, icon: '/assets/icons/archive.png' },
        photolog: { element: new PhotologSection, icon: '/assets/icons/photographer.png' }
    };

    const element = new DeepLinkController(this.original_service);
    const section_name = element.getSectionName();

    element.setSectionMeta(section_map[section_name]);
  }
}

