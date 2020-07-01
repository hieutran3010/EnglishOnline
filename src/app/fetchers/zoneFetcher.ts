import { GraphQLFetcherBase } from './base';
import type Zone from 'app/models/zone';

export default class ZoneFetcher extends GraphQLFetcherBase<Zone> {
  selectFields: string[] = ['id', 'name', 'countries', 'vendorId'];

  constructor() {
    super('Zone', () => this.selectFields);
  }
}
