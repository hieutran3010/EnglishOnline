import { BillParams } from 'app/models/appParam';
import SaleQuotationRate from 'app/models/saleQuotationRate';
import { QuotationReport } from 'app/models/vendor';

/* --- STATE --- */
export interface QuickQuotationState {
  isFetchingQuotation: boolean;
  quotationReports: QuotationReport[];

  billParams?: BillParams;

  isFetchingSaleRate: boolean;
  saleRates: SaleQuotationRate[];

  isSubmittingSaleRate: boolean;
  isDeletingSaleRate: boolean;
}

export type ContainerState = QuickQuotationState;
