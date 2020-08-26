import { BillDeliveryHistory } from 'app/models/bill';

/* --- STATE --- */
export interface BillDeliveryHistoryState {
  isFetchingHistories: boolean;
  groupedHistories: GroupedHistory[];
  histories: BillDeliveryHistory[];
  isDirty: boolean;
  cachedHistories: BillDeliveryHistory[];
  isSaving: boolean;
}

export interface GroupedHistory {
  date: string | undefined | null;
  rawDate: any;
  histories: BillDeliveryHistory[];
}

export type ContainerState = BillDeliveryHistoryState;
