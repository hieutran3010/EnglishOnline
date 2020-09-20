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
}

export class ServiceAssignmentResult {
  newZones: Zone[] = [];
  deletedZoneIds: string[] = [];
}

export class QuotationReport {
  vendorName!: string;
  otherFeeInUsd?: number;
  fuelChargePercent?: number;
  quotation: QuotationReportDetail[] = [];
}

export class QuotationReportDetail {
  zone!: string;
  service!: string;
  purchasePriceInUsd!: number;
  purchasePriceInVnd!: number;
  purchasePriceAfterVatInUsd!: number;
  purchasePriceAfterVatInVnd!: number;
  quotationPriceInUsd?: number;
  vendorNetPriceInUsd?: number;
}

export class QuotationReportParams {
  destinationCountry!: string;
  weightInKg!: number;
  vat?: number;
  usdExchangeRate!: number;
  isApplySaleRate!: boolean;
}
