import AppParam, { BillParams } from 'app/models/appParam';

/* --- STATE --- */
export interface SettingState {
  isFetchingAppParams: boolean;
  appParams: AppParam[];
  billParams: BillParams;

  isUpdatingBillParams: boolean;
}

export type ContainerState = SettingState;
