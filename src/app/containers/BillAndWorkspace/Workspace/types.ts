import type Bill from 'app/models/bill';

/* --- STATE --- */
export interface WorkspaceState {
  bill: Bill;

  numberOfUncheckedVatBills: number;
  needToReloadWorkingBills: boolean;

  myBills: Bill[];
  isFetchingMyBills: boolean;
  selectedMonth: number;
  page: number;
  pageSize: number;
}

export type ContainerState = WorkspaceState;
