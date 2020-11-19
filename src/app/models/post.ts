import ModelBase from './modelBase';

export default class Post extends ModelBase {
  owner!: string;
  content!: string;
}
