import { BillDeliveryHistory } from 'app/models/bill';

/* --- STATE --- */
export interface BillDeliveryHistoryState {
  isFetchingHistories: boolean;
  histories: GroupedHistory[];
}

export interface GroupedHistory {
  date: string | undefined | null;
  histories: BillDeliveryHistory[];
}

export type ContainerState = BillDeliveryHistoryState;
