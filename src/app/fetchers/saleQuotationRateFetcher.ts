import { GraphQLFetcherBase } from './base';
import SaleQuotationRate from 'app/models/saleQuotationRate';

export default class SaleQuotationRateFetcher extends GraphQLFetcherBase<
  SaleQuotationRate
> {
  selectFields: string[] = ['id', 'fromWeight', 'toWeight', 'percent'];

  constructor() {
    super('SaleQuotationRate', () => this.selectFields);
  }
}
