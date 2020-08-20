import type Vendor from 'app/models/vendor';
import type { PurchasePriceInfo, BILL_STATUS } from 'app/models/bill';
import type User from 'app/models/user';
import type { BillParams } from 'app/models/appParam';

/* --- STATE --- */
export interface BillCreateOrUpdateState {
  isFetchingVendor: boolean;
  vendors: Vendor[];

  isFetchingVendorCountries: boolean;
  vendorCountries: string[];

  isSubmitting: boolean;
  billId: string;
  purchasePriceInfo: PurchasePriceInfo;
  oldWeightInKg?: number;
  billStatus: BILL_STATUS;

  isFetchingResponsibilityUsers: boolean;
  users: User[];

  isDeletingBill: boolean;
  isAssigningAccountant: boolean;
  isCalculatingPurchasePrice: boolean;
  isFinalBill: boolean;
  isAssigningLicense: boolean;

  billParams: BillParams;
}

export interface SubmitBillAction {
  billFormValues: any;
  isDirty: boolean;
}

export type ContainerState = BillCreateOrUpdateState;
