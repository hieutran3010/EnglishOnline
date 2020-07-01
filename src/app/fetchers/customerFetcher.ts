import { GraphQLFetcherBase } from './base';
import type Customer from 'app/models/customer';

export default class CustomerFetcher extends GraphQLFetcherBase<Customer> {
  selectFields: string[] = [
    'id',
    'name',
    'code',
    'nickName',
    'phone',
    'address',
    'hint',
    'saleUserId',
  ];

  constructor() {
    super('Customer', () => this.selectFields);
  }
}
