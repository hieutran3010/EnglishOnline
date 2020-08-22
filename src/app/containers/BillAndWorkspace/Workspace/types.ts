import type Bill from 'app/models/bill';

/* --- STATE --- */
export interface WorkspaceState {
  bill: Bill;

  numberOfUncheckedVatBills: number;
  needToReloadWorkingBills: boolean;
}

export type ContainerState = WorkspaceState;
