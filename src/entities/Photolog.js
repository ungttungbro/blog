/************************************************************************
    * 함수명 : 
    * 설 명 :  
    * 인 자 : 
    * 작성자 : 
    * 수정일 수정자 수정내용
    * ------ ------ -------------------
    * 2025.12.01 jyw update
  ************************************************************************/

export class Photolog {

  constructor(data) {
    this.data = data;
    this.title = data.title;
    this.contents = data.contents;
    this.photos = data.photos;
    this.thumbnails = data.thumbnails;
  }
}