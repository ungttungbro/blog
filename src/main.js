'use strict';

import { shell } from './modules/shell/Shell.js';

import { MainService } from './service/MainService.js';
import { BlogService } from './service/BlogService.js';

import { AboutSection } from './view/AboutSection.js';
import { WritingsSection } from './view/WritingsSection.js';
import { ReflectionSection } from './view/ReflectionSection.js';
import { LifelogSection } from "./view/LifelogSection.js";
import { ArchiveSection } from './view/ArchiveSection.js';
import { PhotologSection } from './view/PhotologSection.js';
import { LinksSection } from './view/LinksSection.js';

document.addEventListener('DOMContentLoaded', async () => {
  /**
   * Service Initialization
   */
  const blog_service = new BlogService();
  const main_service = new MainService();
 
  const taskbar_element = document.getElementById('taskbar');

  await Promise.all([
    blog_service.initialize(),
    main_service.initialize(),
    shell.initialize(taskbar_element)
  ]);   

  /**
   * View Section Initialization
   */
  const about_section = new AboutSection(main_service);
  const links_section = new LinksSection(main_service);
  const writings_section = new WritingsSection(main_service, blog_service);
  const reflection_section = new ReflectionSection(main_service, blog_service);
  const lifelog_section = new LifelogSection(main_service, blog_service);
  const archive_section = new ArchiveSection(main_service, blog_service);
  const photolog_section = new PhotologSection(main_service, blog_service);

  await Promise.all([
      about_section.show(),
      links_section.show(),
      writings_section.show(),
      reflection_section.show(),
      lifelog_section.show(),
      archive_section.show(),
      photolog_section.show()
  ]);

  shell.initLayoutMemory();
  shell.updateLayout();


  /*for (const [key, value] of main_service.handleDeepLink()) {
      console.log(key, value);
  }*/
  /*const params = main_service.handleDeepLink();
  const section_type = params.get('section');
  const content_id = params.get('id');
  const path = section_type + params.get('path');

  const section_map = new Map([
      ['about', about_section],
      ['links', links_section],
      ['writings', writings_section],
      ['reflection', reflection_section],
      ['lifelog', lifelog_section],
      ['archive', archive_section],
      ['photolog', photolog_section]
  ]);

  section_map.get("writings").loadContentByParams("20160630A");*/

  /*console.log(section_type);
  console.log(content_id);
  console.log(path);*/
});

