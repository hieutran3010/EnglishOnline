import { GraphQLFetcherBase } from './base';
import type Vendor from 'app/models/vendor';
import type VendorQuotation from 'app/models/vendorQuotation';

export default class VendorFetcher extends GraphQLFetcherBase<Vendor> {
  selectFields: string[] = [
    'id',
    'name',
    'officeAddress',
    'phone',
    'otherFeeInUsd',
    'fuelChargePercent',
    'isStopped',
  ];

  constructor() {
    super('Vendor', () => this.selectFields);
  }

  updateQuotation = (vendorQuotations: VendorQuotation[], vendorId: string) => {
    return this.executeCustomMutationAsync(
      'updateQuotation',
      { vendorId, vendorQuotations },
      { input: 'VendorQuotationUpdateInput!' },
    );
  };
}
