import type Vendor from 'app/models/vendor';
import Bill, { PurchasePriceInfo, BILL_STATUS } from 'app/models/bill';
import type User from 'app/models/user';
import type { BillParams } from 'app/models/appParam';

/* --- STATE --- */
export interface BillCreateOrUpdateState {
  isFetchingVendor: boolean;
  vendors: Vendor[];

  isFetchingVendorCountries: boolean;
  vendorCountries: string[];

  isSubmitting: boolean;

  bill: Bill;
  billId: string;
  purchasePriceInfo: PurchasePriceInfo;
  oldWeightInKg?: number;
  billStatus: BILL_STATUS;
  senderId?: string;
  receiverId?: string;

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
