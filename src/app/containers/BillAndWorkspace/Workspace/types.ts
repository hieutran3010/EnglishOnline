import type Vendor from 'app/models/vendor';
import type Bill from 'app/models/bill';
import type User from 'app/models/user';
import { BillParams } from 'app/models/appParam';

/* --- STATE --- */
export interface WorkspaceState {
  isFetchingVendor: boolean;
  vendors: Vendor[];

  isFetchingVendorCountries: boolean;
  vendorCountries: string[];

  isSubmitting: boolean;
  bill: Bill;

  isFetchingResponsibilityUsers: boolean;
  users: User[];

  isDeletingBill: boolean;
  isAssigningAccountant: boolean;
  isCalculatingPurchasePrice: boolean;
  isFinalBill: boolean;
  isAssigningLicense: boolean;

  billParams: BillParams;
  numberOfUncheckedVatBills: number;
  needToReloadWorkingBills: boolean;
}

export type ContainerState = WorkspaceState;
