import { GraphQLFetcherBase } from './base';
import BillDescription from 'app/models/billDescription';

export default class BillDescriptionFetcher extends GraphQLFetcherBase<
  BillDescription
> {
  selectFields: string[] = ['id', 'name'];

  constructor() {
    super('BillDescription', () => this.selectFields);
  }
}
