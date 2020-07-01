import type Vendor from 'app/models/vendor';

/* --- STATE --- */
export interface VendorDetailState {
  isFetchingVendor: boolean;
  vendor: Vendor;
}

export type ContainerState = VendorDetailState;
