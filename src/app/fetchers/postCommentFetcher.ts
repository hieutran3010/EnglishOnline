import PostComment from 'app/models/postComment';
import { GraphQLFetcherBase } from './base';

export default class PostCommentFetcher extends GraphQLFetcherBase<
  PostComment
> {
  selectFields: string[] = ['id', 'owner', 'content', 'postId'];

  constructor() {
    super('PostComment', () => this.selectFields);
  }
}
