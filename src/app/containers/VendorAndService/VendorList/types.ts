import Vendor from 'app/models/vendor';

/* --- STATE --- */
export interface VendorListState {
  isDeleting: boolean;
  isFetchingVendors: boolean;
  vendors: Vendor[];
  totalVendor?: number;
  pageSize: number;
}

export type ContainerState = VendorListState;
