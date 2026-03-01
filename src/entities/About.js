/************************************************************************
    * 클래스명 : About 
    * 설 명 : 자기소개 관련 엔티티 클래스
    * 인 자 : About 관련 Json 데이터    
  ************************************************************************/

export class About {

  constructor(data) {
    this.data = data;
    this.title = data.title;
    this.photos = data.photos;
    this.specs = data.specs;
    this.contacts = data.contacts;
  }
}

  