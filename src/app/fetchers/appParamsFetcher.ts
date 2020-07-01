import { GraphQLFetcherBase } from './base';
import AppParam from 'app/models/appParam';

export default class AppParamsFetcher extends GraphQLFetcherBase<AppParam> {
  selectFields: string[] = ['id', 'key', 'value'];

  constructor() {
    super('Params', () => this.selectFields);
  }
}
