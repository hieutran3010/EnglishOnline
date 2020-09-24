import Bill from 'app/models/bill';

/* --- STATE --- */
export interface BillViewState {
  isSubmitting: boolean;
}

export interface BillViewActionType {
  billId: string;
  succeededCallback?: (bill: Bill | string) => void;
}

export type ContainerState = BillViewState;
