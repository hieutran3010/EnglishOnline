import ModelBase from './modelBase';

export default class PostComment extends ModelBase {
  owner!: string;
  content!: string;
  postId!: string;
}
