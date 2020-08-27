import Bill, { BillDeliveryHistory } from 'app/models/bill';

/* --- STATE --- */
export interface BillDeliveryHistoryState {
  isFetchingHistories: boolean;
  groupedHistories: GroupedHistory[];
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
}

export type ContainerState = BillDeliveryHistoryState;
