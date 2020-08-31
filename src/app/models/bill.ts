import moment from 'moment';
import { v4 as uuidV4 } from 'uuid';

import ModelBase from './modelBase';
import { PurchasePriceCountingResult } from './purchasePriceCounting';

export enum BILL_STATUS {
  LICENSE = 'LICENSE',
  ACCOUNTANT = 'ACCOUNTANT',
  DONE = 'DONE',
}

export enum PAYMENT_TYPE {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export enum PARCEL_VENDOR {
  DHL_VN = 'DHL VN',
  DHL_SING = 'DHL SING',
  UPS = 'UPS',
  TNT = 'TNT',
  FEDEX = 'FEDEX',
}

export class PurchasePriceInfo {
  weightInKg!: number;
  oldWeightInKg?: number;
  destinationCountry!: string;
  quotationPriceInUsd?: number;
  zoneName?: string;
  purchasePriceInVnd?: number;
  purchasePriceAfterVatInUsd?: number;
  purchasePriceAfterVatInVnd?: number;
  vendorNetPriceInUsd?: number;
  vendorOtherFee!: number;
  vendorFuelChargePercent!: number;
  vendorFuelChargeFeeInUsd?: number;
  vendorFuelChargeFeeInVnd?: number;
  purchasePriceInUsd?: number;
  vat?: number;
  usdExchangeRate!: number;
  oldPurchasePriceInUsd?: number;
  oldPurchasePriceInVnd?: number;
  oldPurchasePriceAfterVatInUsd?: number;
  oldPurchasePriceAfterVatInVnd?: number;
  billQuotations: BillQuotation[] = [];
  oldQuotationPriceInUsd?: number;
  lastUpdatedQuotation?: Date;

  /**
   *
   */
  constructor(input?: PurchasePriceInfo) {
    if (input) {
      this.weightInKg = input.weightInKg;
      this.destinationCountry = input.destinationCountry;
      this.quotationPriceInUsd = input.quotationPriceInUsd;
      this.zoneName = input.zoneName;
      this.purchasePriceInVnd = input.purchasePriceInVnd;
      this.purchasePriceInUsd = input.purchasePriceInUsd;
      this.purchasePriceAfterVatInUsd = input.purchasePriceAfterVatInUsd;
      this.purchasePriceAfterVatInVnd = input.purchasePriceAfterVatInVnd;
      this.vendorNetPriceInUsd = input.vendorNetPriceInUsd;
      this.vendorOtherFee = input.vendorOtherFee;
      this.vendorFuelChargePercent = input.vendorFuelChargePercent;
      this.vendorFuelChargeFeeInUsd = input.vendorFuelChargeFeeInUsd;
      this.vendorFuelChargeFeeInVnd = input.vendorFuelChargeFeeInVnd;
      this.purchasePriceInUsd = input.purchasePriceInUsd;
      this.vat = input.vat;
      this.usdExchangeRate = input.usdExchangeRate;
      this.oldPurchasePriceInUsd = input.oldPurchasePriceInUsd;
      this.oldPurchasePriceInVnd = input.oldPurchasePriceInVnd;
      this.oldPurchasePriceAfterVatInUsd = input.oldPurchasePriceAfterVatInUsd;
      this.oldPurchasePriceAfterVatInVnd = input.oldPurchasePriceAfterVatInVnd;
      this.billQuotations = input.billQuotations;
      this.oldWeightInKg = input.oldWeightInKg;
      this.oldQuotationPriceInUsd = input.oldQuotationPriceInUsd;
      this.lastUpdatedQuotation = input.lastUpdatedQuotation;
    }
  }

  updateFromCountingResult(
    result: PurchasePriceCountingResult,
    isGetLatestQuotation: boolean = false,
  ) {
    this.purchasePriceInUsd = result.purchasePriceInUsd;
    this.purchasePriceInVnd = result.purchasePriceInVnd;
    this.vendorFuelChargeFeeInUsd = result.fuelChargeFeeInUsd;
    this.vendorFuelChargeFeeInVnd = result.fuelChargeFeeInVnd;
    this.quotationPriceInUsd = result.quotationPriceInUsd;
    this.vendorNetPriceInUsd = result.vendorNetPriceInUsd;
    this.purchasePriceAfterVatInUsd = result.purchasePriceAfterVatInUsd;
    this.purchasePriceAfterVatInVnd = result.purchasePriceAfterVatInVnd;

    if (isGetLatestQuotation) {
      this.zoneName = result.zoneName;
      this.billQuotations = result.billQuotations;
      this.lastUpdatedQuotation = result.lastUpdatedQuotation;
    }
  }

  updateNewWeightPurchasePrice(
    result: PurchasePriceCountingResult,
    newWeight: number,
    oldWeight: number,
    isUseLatestQuotation: boolean,
  ) {
    this.oldQuotationPriceInUsd = this.quotationPriceInUsd;
    this.weightInKg = newWeight;
    this.oldWeightInKg = oldWeight;

    // Clear the manual purchase price
    this.oldPurchasePriceInUsd = undefined;
    this.oldPurchasePriceInVnd = undefined;
    this.oldPurchasePriceAfterVatInUsd = undefined;
    this.oldPurchasePriceAfterVatInVnd = undefined;

    this.updateFromCountingResult(result, isUseLatestQuotation);
  }

  restoreOldWeightPurchasePrice(
    result: PurchasePriceCountingResult,
    isUseLatestQuotation: boolean,
  ) {
    this.updateFromCountingResult(result, isUseLatestQuotation);

    this.weightInKg = this.oldWeightInKg || 0;

    // clear old quotation
    this.oldQuotationPriceInUsd = undefined;
    this.oldWeightInKg = undefined;
    // Clear the manual purchase price
    this.oldPurchasePriceInUsd = undefined;
    this.oldPurchasePriceInVnd = undefined;
    this.oldPurchasePriceAfterVatInUsd = undefined;
    this.oldPurchasePriceAfterVatInVnd = undefined;
  }
}

export default class Bill extends ModelBase {
  saleUserId?: string;
  licenseUserId?: string;
  accountantUserId?: string;
  senderName!: string;
  senderPhone!: string;
  senderAddress!: string;
  receiverName!: string;
  receiverPhone!: string;
  receiverAddress!: string;
  date: any;
  period!: string;
  childBillId?: string;
  airlineBillId!: string;
  vendorId!: string;
  vendorName!: string;
  senderId?: string;
  receiverId?: string;
  internationalParcelVendor!: PARCEL_VENDOR;
  description!: string;
  destinationCountry!: string;
  weightInKg!: number;
  oldWeightInKg?: number;
  salePrice?: number;
  purchasePriceInUsd?: number;
  purchasePriceInVnd?: number;
  profit?: number;
  vat?: number;
  status: BILL_STATUS;
  vendorNetPriceInUsd?: number;
  vendorOtherFee: number;
  vendorFuelChargePercent: number;
  vendorFuelChargeFeeInUsd?: number;
  vendorFuelChargeFeeInVnd?: number;
  customerPaymentType?: PAYMENT_TYPE;
  customerPaymentAmount?: number;
  customerPaymentDebt?: number;
  vendorPaymentType?: PAYMENT_TYPE;
  vendorPaymentAmount?: number;
  vendorPaymentDebt?: number;
  usdExchangeRate: number;
  isArchived: boolean;
  quotationPriceInUsd?: number;
  zoneName?: string;
  purchasePriceAfterVatInUsd?: number;
  purchasePriceAfterVatInVnd?: number;
  isPrintedVatBill!: boolean;
  oldPurchasePriceInUsd?: number;
  oldPurchasePriceInVnd?: number;
  oldPurchasePriceAfterVatInUsd?: number;
  oldPurchasePriceAfterVatInVnd?: number;
  oldQuotationPriceInUsd?: number;
  billQuotations: BillQuotation[] = [];
  lastUpdatedQuotation?: Date;

  constructor(input?: Bill | any) {
    super(input);
    if (input) {
      this.saleUserId = input.saleUserId;
      this.licenseUserId = input.licenseUserId;
      this.accountantUserId = input.accountantUserId;
      this.senderName = input.senderName;
      this.senderPhone = input.senderPhone;
      this.senderAddress = input.senderAddress;
      this.receiverName = input.receiverName;
      this.receiverPhone = input.receiverPhone;
      this.receiverAddress = input.receiverAddress;
      this.date = moment(input.date);
      this.childBillId = input.childBillId;
      this.airlineBillId = input.airlineBillId;
      this.vendorId = input.vendorId;
      this.vendorName = input.vendorName;
      this.senderId = input.senderId;
      this.receiverId = input.receiverId;
      this.internationalParcelVendor = input.internationalParcelVendor;
      this.description = input.description;
      this.destinationCountry = input.destinationCountry;
      this.weightInKg = input.weightInKg;
      this.oldWeightInKg = input.oldWeightInKg;
      this.salePrice = input.salePrice || 0;
      this.purchasePriceInUsd = input.purchasePriceInUsd;
      this.purchasePriceInVnd = input.purchasePriceInVnd;
      this.vat = input.vat;
      this.status = input.status || BILL_STATUS.LICENSE;
      this.vendorOtherFee = input.vendorOtherFee || 0;
      this.vendorFuelChargePercent = input.vendorFuelChargePercent || 0;
      this.vendorFuelChargeFeeInUsd = input.vendorFuelChargeFeeInUsd;
      this.vendorFuelChargeFeeInVnd = input.vendorFuelChargeFeeInVnd;
      this.usdExchangeRate = input.usdExchangeRate;
      this.isArchived = input.isArchived || false;
      this.quotationPriceInUsd = input.quotationPriceInUsd;
      this.zoneName = input.zoneName;
      this.vendorNetPriceInUsd = input.vendorNetPriceInUsd;
      this.purchasePriceAfterVatInUsd = input.purchasePriceAfterVatInUsd;
      this.purchasePriceAfterVatInVnd = input.purchasePriceAfterVatInVnd;
      this.customerPaymentType = input.customerPaymentType;
      this.vendorPaymentType = input.vendorPaymentType;
      this.customerPaymentAmount = input.customerPaymentAmount;
      this.customerPaymentDebt = input.customerPaymentDebt;
      this.vendorPaymentAmount = input.vendorPaymentAmount;
      this.vendorPaymentDebt = input.vendorPaymentDebt;
      this.profit = input.profit;
      this.isPrintedVatBill = input.isPrintedVatBill;
      this.oldPurchasePriceInUsd = input.oldPurchasePriceInUsd;
      this.oldPurchasePriceInVnd = input.oldPurchasePriceInVnd;
      this.oldPurchasePriceAfterVatInUsd = input.oldPurchasePriceAfterVatInUsd;
      this.oldPurchasePriceAfterVatInVnd = input.oldPurchasePriceAfterVatInVnd;
      this.billQuotations = input.billQuotations;
      this.oldQuotationPriceInUsd = input.oldQuotationPriceInUsd;
      this.lastUpdatedQuotation = input.lastUpdatedQuotation;
    } else {
      this.status = BILL_STATUS.LICENSE;
      this.vendorOtherFee = 0;
      this.vendorFuelChargePercent = 0;
      this.usdExchangeRate = 0;
      this.date = moment();
      this.isArchived = false;
      this.salePrice = 0;
      this.customerPaymentType = PAYMENT_TYPE.CASH;
      this.vendorPaymentType = PAYMENT_TYPE.CASH;
      this.isPrintedVatBill = false;
    }
  }

  getPurchasePriceInfo(): PurchasePriceInfo {
    const info = new PurchasePriceInfo();
    info.weightInKg = this.weightInKg;
    info.oldWeightInKg = this.oldWeightInKg;
    info.destinationCountry = this.destinationCountry;
    info.zoneName = this.zoneName;
    info.quotationPriceInUsd = this.quotationPriceInUsd;
    info.vendorNetPriceInUsd = this.vendorNetPriceInUsd;
    info.vendorOtherFee = this.vendorOtherFee;
    info.vendorFuelChargePercent = this.vendorFuelChargePercent;
    info.vendorFuelChargeFeeInUsd = this.vendorFuelChargeFeeInUsd;
    info.vendorFuelChargeFeeInVnd = this.vendorFuelChargeFeeInVnd;
    info.purchasePriceInUsd = this.purchasePriceInUsd;
    info.vat = this.vat;
    info.usdExchangeRate = this.usdExchangeRate;
    info.purchasePriceAfterVatInVnd = this.purchasePriceAfterVatInVnd;
    info.purchasePriceAfterVatInUsd = this.purchasePriceAfterVatInUsd;
    info.purchasePriceInVnd = this.purchasePriceInVnd;
    info.oldPurchasePriceInUsd = this.oldPurchasePriceInUsd;
    info.oldPurchasePriceInVnd = this.oldPurchasePriceInVnd;
    info.oldPurchasePriceAfterVatInUsd = this.oldPurchasePriceAfterVatInUsd;
    info.oldPurchasePriceAfterVatInVnd = this.oldPurchasePriceAfterVatInVnd;
    info.billQuotations = this.billQuotations;
    info.oldWeightInKg = this.oldWeightInKg;
    info.oldQuotationPriceInUsd = this.oldQuotationPriceInUsd;
    info.lastUpdatedQuotation = this.lastUpdatedQuotation;
    return info;
  }

  updatePurchasePriceInfo(result: PurchasePriceInfo) {
    this.purchasePriceInUsd = result.purchasePriceInUsd;
    this.purchasePriceInVnd = result.purchasePriceInVnd;
    this.vendorFuelChargeFeeInUsd = result.vendorFuelChargeFeeInVnd;
    this.vendorFuelChargeFeeInVnd = result.vendorFuelChargeFeeInVnd;
    this.quotationPriceInUsd = result.quotationPriceInUsd;
    this.vendorNetPriceInUsd = result.vendorNetPriceInUsd;
    this.zoneName = result.zoneName;
    this.purchasePriceAfterVatInUsd = result.purchasePriceAfterVatInUsd;
    this.purchasePriceAfterVatInVnd = result.purchasePriceAfterVatInVnd;
    this.oldPurchasePriceInUsd = result.oldPurchasePriceInUsd;
    this.oldPurchasePriceInVnd = result.oldPurchasePriceInVnd;
    this.oldPurchasePriceAfterVatInUsd = result.oldPurchasePriceAfterVatInUsd;
    this.oldPurchasePriceAfterVatInVnd = result.oldPurchasePriceAfterVatInVnd;
    this.billQuotations = result.billQuotations;
    this.oldQuotationPriceInUsd = result.oldQuotationPriceInUsd;
    this.lastUpdatedQuotation = result.lastUpdatedQuotation;
    this.weightInKg = result.weightInKg;
    this.oldWeightInKg = result.oldWeightInKg;
  }
}

export class VendorStatistic {
  vendorId!: string;
  vendorName!: string;
  totalPurchase!: number;
  totalDebt!: number;
  totalPayment!: number;
  totalCashPayment!: number;
  totalBankTransferPayment!: number;
  totalBill!: number;
  totalSalePrice!: number;
  totalProfit!: number;
  totalRawProfit!: number;
  totalRawProfitBeforeTax!: number;
}

export class CustomerStatistic {
  senderName!: string;
  senderPhone!: string;
  totalPurchase!: number;
  totalSalePrice!: number;
  totalDebt!: number;
  totalPayment!: number;
  totalCashPayment!: number;
  totalBankTransferPayment!: number;
  totalBill!: number;
  totalProfit!: number;
  totalRawProfit!: number;
  totalRawProfitBeforeTax!: number;
}

export class BillDeliveryHistory {
  id?: string;
  date?: any;
  time?: any;
  status?: string;

  constructor(input?: any) {
    this.id = uuidV4();
    if (input) {
      this.date = input.date ?? null;
      this.time = input.time ?? null;
      this.status = input.status;
    }
  }
}

export class BillQuotation {
  startWeight?: number;
  endWeight!: number;
  priceInUsd?: number;
}
