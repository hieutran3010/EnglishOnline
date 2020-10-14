import { GraphQLFetcherBase, RestfulFetcherBase } from './base';
import Bill, {
  VendorStatistic,
  CustomerStatistic,
  BillDeliveryHistory,
  SaleReport,
} from 'app/models/bill';
import type {
  PurchasePriceCountingParams,
  PurchasePriceCountingResult,
} from 'app/models/purchasePriceCounting';
import { authStorage } from 'app/services/auth';
import { Role } from 'app/models/user';
import { concat, isEmpty } from 'lodash';

const normalFields: string[] = [
  'id',
  'saleUserId',
  'licenseUserId',
  'accountantUserId',
  'senderName',
  'senderPhone',
  'senderAddress',
  'receiverName',
  'receiverPhone',
  'receiverAddress',
  'date',
  'period',
  'childBillId',
  'airlineBillId',
  'vendorId',
  'vendorName',
  'senderId',
  'receiverId',
  'internationalParcelVendor',
  'description',
  'weightInKg',
  'status',
  'isArchived',
  'destinationCountry',
  'isPrintedVatBill',
  'createdOn',
  'billDeliveryHistories {date time status}',
];

const saleExtendFields: string[] = ['vat', 'usdExchangeRate', 'salePrice'];

const otherFields: string[] = [
  'purchasePriceInUsd',
  'purchasePriceInVnd',
  'purchasePriceAfterVatInUsd',
  'purchasePriceAfterVatInVnd',
  'profit',
  'vendorNetPriceInUsd',
  'vendorOtherFee',
  'vendorFuelChargePercent',
  'vendorFuelChargeFeeInUsd',
  'vendorFuelChargeFeeInVnd',
  'quotationPriceInUsd',
  'zoneName',
  'vendorPaymentType',
  'vendorPaymentAmount',
  'customerPaymentType',
  'customerPaymentAmount',
  'otherCustomerPaymentAmount',
  'vendorPaymentDebt',
  'customerPaymentDebt',
  'oldWeightInKg',
  'oldPurchasePriceInUsd',
  'oldPurchasePriceInVnd',
  'oldPurchasePriceAfterVatInUsd',
  'oldPurchasePriceAfterVatInVnd',
  'billQuotations {startWeight endWeight priceInUsd}',
  'oldQuotationPriceInUsd',
  'lastUpdatedQuotation',
];

const getBillFields = (extendFields?: string[]) => {
  const role = authStorage.getRole() as Role;

  let result = normalFields;
  switch (role) {
    case Role.LICENSE: {
      break;
    }
    case Role.SALE: {
      result = concat(saleExtendFields, normalFields);
      break;
    }
    case Role.ADMIN:
    case Role.ACCOUNTANT: {
      result = concat(saleExtendFields, normalFields, otherFields);
      break;
    }
    default:
      break;
  }

  if (!isEmpty(extendFields)) {
    return concat(result, extendFields as string[]);
  }

  return result;
};

export default class BillFetcher extends GraphQLFetcherBase<Bill> {
  constructor(extendFields?: string[]) {
    super('Bill', () => getBillFields(extendFields));
  }

  countPurchasePrice = (queryParams: PurchasePriceCountingParams) => {
    return this.executeAsync<PurchasePriceCountingResult>(
      'countPurchasePrice',
      `query($queryParams: PurchasePriceCountingParams!) {
        bill {
          countPurchasePrice(queryParams: $queryParams) {
              quotationPriceInUsd
              vendorNetPriceInUsd
              fuelChargeFeeInUsd
              fuelChargeFeeInVnd
              purchasePriceInUsd
              purchasePriceInVnd
              purchasePriceAfterVatInUsd
              purchasePriceAfterVatInVnd
              zoneName
              billQuotations {startWeight endWeight priceInUsd}
              lastUpdatedQuotation
              service
              vendorId
            }
          }
        }`,
      { queryParams },
    );
  };

  assignToAccountant = (billId: string) => {
    return this.executeAsync<Bill>(
      'assignToAccountant',
      `mutation($billId: GUID!) {
        bill {
          assignToAccountant(billId: $billId) {
            ${getBillFields()}
          }
        }
      }`,
      { billId },
    );
  };

  finalBill = (billId: string) => {
    return this.executeAsync<Bill>(
      'finalBill',
      `mutation($billId: GUID!) {
        bill {
          finalBill(billId: $billId) {
            ${getBillFields()}
          }
        }
      }`,
      { billId },
    );
  };

  getVendorStatistic = (query: string): Promise<VendorStatistic[]> => {
    return this.executeAsync<VendorStatistic[]>(
      'getVendorStatistic',
      `query($query: String!) {
        bill {
          getVendorStatistic(query: $query) {
              vendorId
              vendorName
              totalPurchase
              totalDebt
              totalPayment
              totalBill
              totalSalePrice
              totalCashPayment
              totalBankTransferPayment
              totalProfit
              totalRawProfit
              totalRawProfitBeforeTax
          }
        }
      }`,
      { query },
    );
  };

  getCustomerStatistic = (query: string): Promise<CustomerStatistic[]> => {
    return this.executeAsync<CustomerStatistic[]>(
      'getCustomerStatistic',
      `query($query: String!) {
        bill {
          getCustomerStatistic(query: $query) {
              senderName
              senderPhone
              totalPurchase
              totalSalePrice
              totalDebt
              totalPayment
              totalBill
              totalCashPayment
              totalBankTransferPayment
              totalProfit
              totalRawProfit
              totalRawProfitBeforeTax
          }
        }
      }`,
      { query },
    );
  };

  getSaleReport = (query: string): Promise<SaleReport[]> => {
    return this.executeAsync<SaleReport[]>(
      'getSaleReports',
      `query($query: String!) {
      bill {
        getSaleReports(query: $query) {
          saleUserId
          saleName
          totalSalePrice
          totalRawProfit
          totalRawProfitBeforeTax
          totalProfit
          totalBill
          totalPurchase
        }
      }
    }`,
      { query },
    );
  };
}

export class BillPatchExecutor extends RestfulFetcherBase<Bill> {
  constructor() {
    super('bill');
  }

  updateDeliveryHistory = (
    billId: string,
    histories: BillDeliveryHistory[],
  ) => {
    return this.patch(histories, `updateDeliveryHistory/${billId}`);
  };

  returnFinalBillToAccountant = (billId: string) => {
    return this.patch(undefined, `returnFinalBillToAccountant/${billId}`);
  };

  restoreArchivedBill = (billId: string) => {
    return this.patch(undefined, `restoreArchivedBill/${billId}`);
  };

  archiveBill = (billId: string) => {
    return this.patch(undefined, `archiveBill/${billId}`);
  };

  checkPrintedVatBill = (billId: string): Promise<any> => {
    return this.patch(undefined, `checkPrintedVatBill/${billId}`);
  };
}
