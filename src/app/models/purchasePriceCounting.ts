export const purchasePriceCountingFields = [
  'weightInKg',
  'destinationCountry',
  'vendorId',
  'vat',
  'usdExchangeRate',
  'vendorOtherFee',
  'vendorFuelChargePercent',
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
}

export class PurchasePriceCountingParams {
  vendorId!: string;
  weightInKg!: number;
  destinationCountry!: string;
  otherFeeInUsd!: number;
  fuelChargePercent!: number;
  vat?: number;
  usdExchangeRate!: number;
}
