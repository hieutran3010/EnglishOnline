import Vendor from 'app/models/vendor';

/* --- STATE --- */
export interface VendorQuotationDetailState {
  vendor: Vendor;
  isFetchingVendor: boolean;
  isSubmittingData: boolean;
  submitHasError: boolean;
}

export type ContainerState = VendorQuotationDetailState;
