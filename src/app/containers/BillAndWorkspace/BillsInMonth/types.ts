/* --- STATE --- */
export interface BillsInMonthState {
  needToReload: boolean;
  selectedMonth: number;
  isViewArchivedBills: boolean;
}

export type ContainerState = BillsInMonthState;
