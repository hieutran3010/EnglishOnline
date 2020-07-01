import Vendor from 'app/models/vendor';
import Zone from 'app/models/zone';
import { ExcludedCountry } from 'app/components/Select/CountrySelect';

/* --- STATE --- */
export interface VendorQuotationState {
  vendor: Vendor;
  isFetchingVendor: boolean;
  isSubmittingZone: boolean;
  zones: Zone[];
  mappedCountries: ExcludedCountry[];
  isFetchingZones: boolean;
  isSubmitEditingVendor: boolean;
}

export type ContainerState = VendorQuotationState;
