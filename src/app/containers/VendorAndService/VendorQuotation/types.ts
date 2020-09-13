import Vendor from 'app/models/vendor';
import Zone from 'app/models/zone';
import ParcelService from 'app/models/parcelService';

/* --- STATE --- */
export interface VendorQuotationState {
  vendor: Vendor;
  isFetchingVendor: boolean;
  zones: Zone[];
  isFetchingZones: boolean;
  isSubmitEditingVendor: boolean;

  isSubmittingZone: boolean;
  editingZone?: Zone;
  parcelServices: ParcelService[];
  isFetchingParcelServices: boolean;

  isFetchingAssignedParcelServices: boolean;
  assignedParcelServices: string[];
  isSubmittingSelectedServices: boolean;
}

export type ContainerState = VendorQuotationState;
