'use strict';

import { ELEMENT_TYPE } from "../modules/common/Constants.js"
import { siteMeta } from "../modules/site/siteMeta.js";
import { SiteLibrary } from "../modules/common/SiteLibrary.js";

export class AboutSection {
  constructor(about_service) { 
    this.aboutService = about_service;
    this.initialize();
  }

  async initialize() {
    const section_id = this.aboutService.serviceName;
    this.aboutSectionElement = document.getElementById(section_id);
    this.aboutPhotoElement = null;
  }

  show() {
    try {
      this.renderPhoto();
      this.renderProfile(); 
    } catch (error) {
      console.log('error state : ', error);
    }
  }

  renderPhoto() {  
    this.aboutPhotoElement = SiteLibrary.addChildElement(
      ELEMENT_TYPE.DIV, 
      this.aboutSectionElement, 
      siteMeta.about.photoZoneId
    );

    const photo_element = this.createPhotoElement();

    this.aboutPhotoElement.appendChild(photo_element);
  }
  
  createPhotoElement() {
    const photo_path = this.aboutService.aboutData.photos.get('featured_photo_path');    
    const element = SiteLibrary.createImgElement(
      siteMeta.about.photoClassName,
      '', 
      photo_path, 
      siteMeta.about.photoImgAlt
    );

    return element;
  }

  renderProfile() {    
    const profile_box = SiteLibrary.addChildElement(
      ELEMENT_TYPE.DIV,
      this.aboutSectionElement,
      siteMeta.about.profileBoxId
    );

    const specs = this.createSpecsElement();
    profile_box.appendChild(specs);

    profile_box.appendChild(document.createElement('hr'));
    
    const contacts = this.createContactsElement();
    profile_box.appendChild(contacts);
    
    const thumbnails = this.createThumbnailList();
    profile_box.appendChild(thumbnails);    
  }

  createSpecsElement() {
    const specs_element = document.createElement(ELEMENT_TYPE.DIV);
    specs_element.id = siteMeta.about.specsId;

    const data = this.aboutService.aboutData.specs;
    for (const [key, value] of data) {
      const img = SiteLibrary.createImgElement('small-icon', '',  value[1], '');
      const figure = SiteLibrary.createImgCaption(img, null, value[0]);
      specs_element.appendChild(figure);
    }

    return specs_element;
  }

  createContactsElement() {
    const contacts_element = document.createElement(ELEMENT_TYPE.DIV);
    contacts_element.id = siteMeta.about.contactsId;

    const data = this.aboutService.aboutData.contacts;
    for (const [key, value] of data) {
      const link = document.createElement('a');      
      link.href = value[1];
      link.target = '_blank';

      const text_line = document.createElement('p');

      const title = document.createElement('span');
      title.textContent = key + ' : ';
      
      const caption = document.createElement('span');
      caption.textContent = value[0];

      link.appendChild(caption);

      text_line.appendChild(title);
      text_line.appendChild(link);
      
      contacts_element.appendChild(text_line);
    }

    const hr = document.createElement('hr');
    contacts_element.appendChild(hr);

    return contacts_element;
  }

  createThumbnailList() {
    const frag = document.createDocumentFragment();

    const thumbnail_element = document.createElement(ELEMENT_TYPE.DIV);
    thumbnail_element.id = siteMeta.about.thumbnailsId;
    
    const data = this.aboutService.aboutData.photos.get('photos_data');
    for (const path of data) {
      const thumbnail_img = SiteLibrary.createImgElement(
        siteMeta.about.thumbnailClassName,
        siteMeta.about.thumbnailsId + '_' + path, 
        path, 
        siteMeta.about.thumbnailImgAlt
      );

      this.generateThumbnailEvent(thumbnail_img, path);
      frag.appendChild(thumbnail_img);
    }

    thumbnail_element.appendChild(frag);

    return thumbnail_element;
  }

  generateThumbnailEvent(thumbnail_element, src) {
    thumbnail_element.addEventListener('mouseenter', e => { this.onThumbnailHover(src); });
  }

  onThumbnailHover(src) {
    this.aboutPhotoElement.innerHTML = '';

    const photo = SiteLibrary.createImgElement(
      siteMeta.about.photoClassName, 
      '', 
      src,
      siteMeta.about.photoImgAlt
    );
      
    this.aboutPhotoElement.appendChild(photo);
  }
}
