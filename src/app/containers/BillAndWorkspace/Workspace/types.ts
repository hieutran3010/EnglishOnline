import type Bill from 'app/models/bill';

/* --- STATE --- */
export interface WorkspaceState {
  numberOfUncheckedVatBills: number;

  isLoadingMyBills: boolean;
  myBills: Bill[];
  totalMyBills: number;
  pageSize: number;
  page: number;

  selectedMonth: number;
  searchKey?: string;

  billDateColorMap: {};
  totalSelfCreatedBillsToday: number;
}

export type ContainerState = WorkspaceState;
