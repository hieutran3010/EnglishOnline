import Post from 'app/models/post';
import { GraphQLFetcherBase } from './base';

export default class PostFetcher extends GraphQLFetcherBase<Post> {
  selectFields: string[] = ['id', 'owner', 'content'];

  constructor() {
    super('Post', () => this.selectFields);
  }
}
