export default class ModelBase {
  id: string;

  constructor(entity: any = undefined) {
    if (entity) {
      this.id = entity.id;
    } else {
      this.id = '';
    }
  }
}
