import ModelBase from './modelBase';
import Zone from './zone';
import VendorQuotation from './vendorQuotation';

export default class Vendor extends ModelBase {
  name!: string;
  officeAddress?: string;
  phone?: string;
  otherFeeInUsd!: number;
  fuelChargePercent!: number;
  isStopped!: boolean;
  zones?: Zone[];
  vendorQuotations?: VendorQuotation[];
  lastUpdatedQuotation?: Date;
}
