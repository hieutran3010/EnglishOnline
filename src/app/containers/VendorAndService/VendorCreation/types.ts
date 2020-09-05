import Vendor from 'app/models/vendor';
import { History } from 'history';

/* --- STATE --- */
export interface VendorCreationState {
  isSubmitting: boolean;
  isFetchingVendor: boolean;
  vendor: Vendor;
}
export interface SubmitVendorActionType {
  vendor: Vendor;
  history: History;
}

export type ContainerState = VendorCreationState;
