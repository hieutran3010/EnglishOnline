import type Bill from 'app/models/bill';

/* --- STATE --- */
export interface BillUpdatingState {
  isFetchingBillError: boolean;
  isFetchingBill: boolean;
  bill: Bill;
}

export type ContainerState = BillUpdatingState;
