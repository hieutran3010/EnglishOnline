import User from 'app/models/user';
import { RestfulFetcherBase } from './base';

export default class UserFetcher extends RestfulFetcherBase<User> {
  constructor() {
    super('account');
  }
}
