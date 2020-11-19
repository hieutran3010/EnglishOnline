import ModelBase from './modelBase';
import PostComment from './postComment';

export default class Post extends ModelBase {
  owner!: string;
  content!: string;
  ownerAvatar!: string;
  postComments?: PostComment[];
}
