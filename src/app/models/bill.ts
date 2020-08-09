import ModelBase from './modelBase';
import moment from 'moment';

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
  salePrice?: number;
  purchasePriceInUsd?: number;
  purchasePriceInVnd?: number;
  profit?: number;
  profitBeforeTax?: number;
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
      this.profitBeforeTax = input.profitBeforeTax;
      this.profit = input.profit;
      this.isPrintedVatBill = input.isPrintedVatBill;
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
}

export class VendorStatistic {
  vendorId!: string;
  vendorName!: string;
  totalPurchase!: number;
  totalDebt!: number;
  totalPayment!: number;
  totalBill!: number;
}

export class CustomerStatistic {
  senderName!: string;
  senderPhone!: string;
  totalSalePrice!: number;
  totalDebt!: number;
  totalPayment!: number;
  totalBill!: number;
}
