'use strict';

export class SiteLibrary {

  static async loadJson(url) {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("JSON 파일 로드 실패: " + response.status);
    }
    
    return await response.json();
  }

  static async loadText(url) {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("파일 로드 실패: " + response.status);
    }
    
    return await response.text();
  }

  static async hashString(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);

    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    const hashHex = hashArray
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

    return hashHex;
  }

  static generateRandomNumber(max) {
    return Math.floor(Math.random() * max);
  }

  static addChildElementById(generate_node_type, parent_node_id, child_node_id) {    
    const parent = document.getElementById(parent_node_id);
    if (!parent) {
      throw new Error('Parent element not found: ${parent_node_id}');
    }

    const child = document.getElementById(child_node_id);
    if (child) return child;

    const node = document.createElement(generate_node_type);
    node.id = child_node_id;
    
    const result = parent.appendChild(node);
    
    return result;
  }

  static addChildElement(generate_node_type, parent_element, child_node_id) {
    if (!parent_element) {
      throw new Error('Parent element not found: ${parent_element}');
    }

    const child = document.getElementById(child_node_id);
    if (child) return child;

    const node = document.createElement(generate_node_type);
    node.id = child_node_id;

    const result = parent_element.appendChild(node);
    
    return result;
  }

  static createImgElement(class_name, id, src, alt) {
    const img = document.createElement('img');
     
    img.className = class_name;
    img.id = id;
    img.src =  src;
    img.alt = alt;
       
    return img;
  }

  static createImgCaption(image_element, caption_id, caption_text) {
    const caption = document.createElement('figcaption');
    caption.id = caption_id;
    caption.innerHTML = '&nbsp;' + caption_text;

    const figure = document.createElement('figure');
    figure.appendChild(image_element);
    figure.appendChild(caption);

    return figure;
  }

  static createImgTitle(class_name, img_id, caption_id, src, text, alt) {
    const title_icon = this.createImgElement(
      class_name, 
      img_id,
      src, 
      alt
    );
      
    const figure = this.createImgCaption(title_icon, caption_id, text);
      
    return figure;
  }

  static createImgTitleCaption(image_element, title_text, content_text) {
    const title = document.createElement('figcaption');
    title.className = 'figure-title';
    title.innerHTML = title_text;
  
    const content = document.createElement('figcaption');
    content.className = 'figure-content';
    content.innerHTML = content_text;

    const figure = document.createElement('figure');
    figure.appendChild(image_element);
    figure.appendChild(title);
    figure.appendChild(content);

    return figure;
  }

  static elementVisibility(element_id) {    
    const element = document.getElementById(element_id);

    if (element) {
      if (element.style.visibility == 'hidden') {
        element.style.visibility = 'visible';
      } else {
        element.style.visibility = 'hidden';
      }
    }
  }

  static toggleElementMaximize(element, target_id) {
    if (element.isDragging) return; // 드래그 중이면 최소/최대화 방지

    const element_rect = element.getBoundingClientRect();

    const isMaximized = element.classList.contains('is-maximized');
    if (isMaximized) {
        const prev = element._prevState;

        element.classList.remove('is-maximized');

        element.style.width = prev.width + 'px';
        element.style.height = prev.height + 'px';

        element.style.position = prev.position;
        element.style.top = prev.top + 'px';
        element.style.left = prev.left + 'px';

        element.style.transform = 'none';
        element.style.borderRadius = '0.5rem';
    } else {
        element._prevState = {
          top: element_rect.top,
          left: element_rect.left,
          width: element.offsetWidth,
          height: element.offsetHeight,
          position: getComputedStyle(element).position
        };

        const target_element_rect = document.getElementById(target_id).getBoundingClientRect();
        const viewportHeight = window.visualViewport?.height ?? window.innerHeight;

        element.classList.add('is-maximized');

        element.style.position = 'fixed';
        element.style.top = target_element_rect.bottom + 'px';
        element.style.left = '0';       

        element.style.width = '100%';
        element.style.height = (viewportHeight - target_element_rect.bottom) + 'px';

        element.style.transform = 'none';
        element.style.borderRadius = '0';
    }
}

  static toggleMaximize(element_id, target_id, width, height) {
    const element = document.getElementById(element_id);
    const target = document.getElementById(target_id);
    
    const isMaximized = element.classList.contains(element_id);
    
    if (isMaximized) {
      element.classList.remove(element_id);
      element.style.width = width;
      element.style.height = height;
    } else {      
      element.classList.add(element_id);

      const target_width = target.clientWidth;
      const target_height = window.innerHeight;

      const aspect = parseFloat(width) / parseFloat(height);

      let predict_width = target_width;
      let predict_height = predict_width / aspect;

      if (predict_height > target_height) {
        predict_height = target_height;
        predict_width = predict_height * aspect;
      }

      element.style.width = predict_width + 'px';
      element.style.height = (predict_height * 0.9) + 'px';
    }
  }

  static closeElement(element_id) {
    let element = document.getElementById(element_id);

    if (!element)
      return false;

    element.remove();
    element = null;

    return true;
  }

  static adjustImageSize(src) {
    return new Promise((resolve) => {
        let img = new Image();
        img.src = src;

        img.onload = () => {
          let adjust_width = 0;
          let adjust_height = 0;

          if ((img.width / img.height) > 1 && img.width > window.innerWidth ) {
              adjust_width =  window.innerWidth * 0.55;
              let width_ratio = ( adjust_width / img.width );
              adjust_height = (img.height * width_ratio);
          } else {
              adjust_height =  window.innerHeight * 0.85;
              let height_ratio = ( adjust_height / img.height );
              adjust_width = (img.width * height_ratio);
          }

          let font_size = document.querySelector('html').style.fontSize;
          font_size = font_size.replace('px', '');
          if (!font_size) font_size = 16;

          let result = [];
          result[0] = adjust_width / font_size;
          result[1] = adjust_height / font_size;

          resolve(result);
        };
    });
  }

  static truncateText(text, limit = 100) {
    let width = 0;
    let result = '';

    for (const char of text) {
      let charWidth = 1;

      if (char === ' ') charWidth = 0.6;
      else if (char.charCodeAt(0) <= 0x007f) charWidth = 0.8;

      if (width + charWidth > limit) {
        return result + '…';
      }

      width += charWidth;
      result += char;
    }

    return result;
  }

  static truncateTextLine(width, text, gridFraction = 1, padding = 0, line = 1) {
    if (!text) return '';

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // element의 현재 font 적용
    const element = document.body;
    const computedStyle = getComputedStyle(element);
    ctx.font = `${computedStyle.fontWeight} ${computedStyle.fontSize} ${computedStyle.fontFamily}`;
        
    // 실제 사용할 수 있는 가로 폭
    const gridWidth = width * gridFraction;
    const usableWidth = (gridWidth - padding) * line;

    let truncated = '';
    let currentWidth = 0;

    for (const char of text) {
      const charWidth = ctx.measureText(char).width;
      if (currentWidth + charWidth > usableWidth) {
        truncated += '…';
        break;
      }
      truncated += char;
      currentWidth += charWidth;
    }

    return truncated;
  }


  static isRectOverlap(rect1, rect2, tolerance = 1) {
    return !(
      rect1.right  <= rect2.left  + tolerance ||
      rect1.left   >= rect2.right - tolerance ||
      rect1.bottom <= rect2.top   + tolerance ||
      rect1.top    >= rect2.bottom - tolerance
    );
  }

  static pxToRem(px) {
    const rootFontSize = parseFloat(
      getComputedStyle(document.documentElement).fontSize
    );

    return px / rootFontSize;
  }

  static remToPx(rem) {
    const rootFontSize = parseFloat(
      getComputedStyle(document.documentElement).fontSize
    );

    if (typeof rem === 'string') {
      rem = parseFloat(rem);
    }

    return rem * rootFontSize;
  }
}
