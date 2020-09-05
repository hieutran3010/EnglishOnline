/* --- STATE --- */
export interface BillViewState {
  isSubmitting: boolean;
}

export interface BillViewActionType {
  billId: string;
  succeededCallback?: () => void;
}

export type ContainerState = BillViewState;
