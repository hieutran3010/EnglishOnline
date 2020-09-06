/* --- STATE --- */
export interface BillsInMonthState {
  selectedMonth: number;
  isViewArchivedBills: boolean;
}

export type ContainerState = BillsInMonthState;
