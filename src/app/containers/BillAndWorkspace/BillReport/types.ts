import { VendorStatistic, CustomerStatistic } from 'app/models/bill';
import ExportSession from 'app/models/exportSession';

/* --- STATE --- */
export interface BillReportState {
  isFetchingTotalSalePrice: boolean;
  totalSalePriceOfSale: number;

  isFetchingTotalRevenue: boolean;
  totalRevenue: number;

  isFetchingTotalCustomerDebt: boolean;
  totalCustomerDebt: number;

  isFetchingTotalVendorDebt: boolean;
  totalVendorDebt: number;

  isFetchingTotalRawProfit: boolean;
  totalRawProfitBeforeTax: number;
  totalRawProfit: number;

  isFetchingTotalProfit: boolean;
  totalProfitBeforeTax: number;
  totalProfit: number;

  isFetchingTotalBillCount: boolean;
  totalBillCount: number;

  isFetchingVendorGroupingList: boolean;
  billsGroupedByVendor: VendorStatistic[];

  isFetchingCustomerGroupingList: boolean;
  billsGroupedByCustomer: CustomerStatistic[];

  checkingExportSession: boolean;
  exportSession?: ExportSession;
}

export type ContainerState = BillReportState;
