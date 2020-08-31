import { GraphQLFetcherBase, RestfulFetcherBase } from './base';
import Bill, {
  VendorStatistic,
  CustomerStatistic,
  BillDeliveryHistory,
} from 'app/models/bill';
import type {
  PurchasePriceCountingParams,
  PurchasePriceCountingResult,
} from 'app/models/purchasePriceCounting';
import { authStorage } from 'app/services/auth';
import { Role } from 'app/models/user';

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

const getBillFields = () => {
  const role = authStorage.getRole() as Role;

  switch (role) {
    case Role.LICENSE:
      return normalFields;
    case Role.SALE:
      return [...normalFields, ...saleExtendFields];
    case Role.ADMIN:
    case Role.ACCOUNTANT:
      return [...normalFields, ...saleExtendFields, ...otherFields];
    default:
      break;
  }

  return [];
};

export default class BillFetcher extends GraphQLFetcherBase<Bill> {
  constructor() {
    super('Bill', getBillFields);
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

  archiveBill = (billId: string) => {
    return this.executeCustomMutationAsync(
      'archiveBill',
      { billId },
      { input: 'ArchiveBillInput!' },
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

  checkPrintedVatBill = (billId: string): Promise<any> => {
    return this.executeAsync<CustomerStatistic[]>(
      'checkPrintedVatBill',
      `mutation($billId: GUID!) {
        bill {
          checkPrintedVatBill(billId: $billId) {
            didSuccess
          }
        }
      }`,
      { billId },
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

  restoreFinalBill = (billId: string) => {
    return this.patch(undefined, `restoreFinalBill/${billId}`);
  };

  restoreArchivedBill = (billId: string) => {
    return this.patch(undefined, `restoreArchivedBill/${billId}`);
  };
}
