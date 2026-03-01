/************************************************************************
    * 클래스명 : Bookmark 
    * 설 명 : 자기소개 관련 엔티티 클래스
    * 인 자 : Bookmark 관련 Json 데이터    
  ************************************************************************/

export class Links {

  constructor(data) {
    this.data = data;
    this.title = data.title;
    this.oldMyWeb = data.old_my_web;
    this.thanksTo = data.thanks_to;
  }
}

  