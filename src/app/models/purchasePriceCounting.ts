import Bill, { BillQuotation } from './bill';

export const purchasePriceCountingFields = [
  'weightInKg',
  'destinationCountry',
  'vendorId',
  'vat',
  'usdExchangeRate',
  'vendorOtherFee',
  'vendorFuelChargePercent',
  'billQuotations',
];

export class PurchasePriceCountingResult {
  quotationPriceInUsd!: number;
  vendorNetPriceInUsd!: number;
  fuelChargeFeeInUsd!: number;
  fuelChargeFeeInVnd!: number;
  purchasePriceInUsd!: number;
  purchasePriceInVnd!: number;
  zoneName!: string;
  purchasePriceAfterVatInUsd!: number;
  purchasePriceAfterVatInVnd!: number;
  billQuotations: BillQuotation[] = [];
  lastUpdatedQuotation?: Date;
}

export class PurchasePriceCountingParams {
  vendorId!: string;
  weightInKg!: number;
  destinationCountry!: string;
  otherFeeInUsd!: number;
  fuelChargePercent!: number;
  vat?: number;
  usdExchangeRate!: number;
  billQuotations: BillQuotation[] = [];
  isGetLatestQuotation: boolean = false;
  serviceName?: string;

  constructor(bill?: Bill) {
    if (bill) {
      this.destinationCountry = bill.destinationCountry;
      this.fuelChargePercent = bill.vendorFuelChargePercent || 0;
      this.otherFeeInUsd = bill.vendorOtherFee || 0;
      this.usdExchangeRate = bill.usdExchangeRate || 0;
      this.vat = bill.vat;
      this.vendorId = bill.vendorId;
      this.weightInKg = bill.weightInKg || 0;
      this.billQuotations = bill.billQuotations || [];
      this.serviceName = bill.internationalParcelVendor;
    }
  }
}
