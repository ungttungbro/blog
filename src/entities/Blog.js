export class Blog {
    constructor(data) {
        this.data = data;
        this.title = data.title;
        this.contents = data.contents;
        this.archive = data.archive;
        this.lifelog = data.lifelog;
        this.reflection = data.reflection;
    }
}