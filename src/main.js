'use strict';

import { shell } from './modules/shell/Shell.js';

import { AboutService } from './service/AboutService.js';
import { BlogService } from './service/BlogService.js';
import { PhotologService } from './service/PhotologService.js';
import { LinksService } from './service/LinksService.js';

import { AboutSection } from './view/AboutSection.js';
import { BlogSection } from './view/BlogSection.js';
import { PhotologSection } from './view/PhotologSection.js';
import { LinksSection } from './view/LinksSection.js';

document.addEventListener('DOMContentLoaded', async () => {
  const blog_service = new BlogService();
  const about_service = new AboutService();
  const photolog_service = new PhotologService();
  const links_service = new LinksService();
  const taskbar_element = document.getElementById('taskbar');

  await Promise.all([
    blog_service.initialize(),
    about_service.initialize(),
    photolog_service.initialize(),
    links_service.initialize(),
    shell.initialize(taskbar_element)
  ]);
   
  new BlogSection(blog_service).show();  
  new AboutSection(about_service).show();  
  new PhotologSection(photolog_service).show();  
  new LinksSection(links_service).show();  
   
  shell.initLayoutMemory();
  shell.updateLayout();
});