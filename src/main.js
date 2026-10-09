'use strict';

import { SiteLibrary } from "./modules/common/SiteLibrary.js";
import { Templates } from "./modules/site/Templates.js";

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

  /**
   * Run the Deep Link
   */
  const section_map = new Map([
    ['writings',  [writings_section, '/assets/icons/blog.png']],
    ['reflection',[reflection_section, '/assets/icons/reflection.png']],
    ['lifelog',   [lifelog_section, '/assets/icons/lifelog.png']],
    ['archive',   [archive_section, '/assets/icons/archive.png']],
    ['photolog',  [photolog_section, '/assets/icons/photographer.png']]
  ]);

 /* const view_size_map = {
    writings: {
        landscape: { width: 0.7, height: 0.8 },
        portrait:  { width: 0.5, height: 0.8 }
    },
    photolog: {
        landscape: { width: 0.8, height: 0.7 },
        portrait:  { width: 0.6, height: 0.8 }
    }
};*/


  const params = new URLSearchParams(location.search);

  if (params.size === 3) {
    const section = params.get('section');
    const id = params.get('id');
    const orientation = params.get('orientation');

    const record = await blog_service.getContentByParams(section, id);

    if (record) {
      const section_data = section_map.get(section);

      const section_view = section_data[0];
      const section_icon = section_data[1];

      const contentUrl = section_view._BASE_PATH + id + '/';

      let header = null;
      let footer = '&copy; Jonas';
      let title = record.title;
      let contents = contentUrl + record.contentUrl;

      if (section === "photolog") {
        header = "<br>" +
          "<p style=\"font-size:0.85rem; color:var(--base_anchor_tag_hover_color);\">" +
            "&#128247;&nbsp;&nbsp" +
            record.date + " · " +
            record.tags.map(tag => '#' + tag).join(" · ") +
          "</p>";

        contents = record.files;
      } 
      
      if (section === "lifelog") {
          footer = document.createElement('span');
          footer.className = 'footer';
          footer.innerHTML = "<p align='right' style='font-size:0.85rem; font-weight:400;'>" 
                              + Templates.symbol(record.type) + record.date + ' (' + record.location + ')'
                              + "</p>";
          footer.innerHTML += '&copy; Jonas';              
         
          title = record.tags;         
      }

      section_view.openPost(
        'viewer-content-' + await SiteLibrary.hashString(id),
        section,
        section_icon,
        title,
        orientation, 1.35, 0.6, 0, 0,
        header,
        contents,
        footer
      );
    }
  }
});

