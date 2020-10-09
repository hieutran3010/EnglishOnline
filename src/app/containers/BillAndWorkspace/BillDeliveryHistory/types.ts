import Bill, { BillDeliveryHistory } from 'app/models/bill';

/* --- STATE --- */
export interface BillDeliveryHistoryState {
  isFetchingHistories: boolean;
  histories: BillDeliveryHistory[];
  isDirty: boolean;
  cachedHistories: BillDeliveryHistory[];
  isSaving: boolean;
  airlineBillId?: string;
  childBillId?: string;
  billId: string;
  isFetchingBillToView: boolean;
  bill?: Bill;
}

export interface GroupedHistory {
  date: string | undefined | null;
  rawDate: any;
  histories: BillDeliveryHistory[];
}

export interface FetchHistoriesCompletedAction {
  histories: BillDeliveryHistory[];
  airlineBillId?: string;
  childBillId?: string;
  billId?: string;
}

export type BillDeliveryHistoriesUpdatedEventArgs = {
  billId: string;
  histories: BillDeliveryHistory[];
};

export type ContainerState = BillDeliveryHistoryState;
