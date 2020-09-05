import ParcelService, { ParcelServiceZone } from 'app/models/parcelService';

/* --- STATE --- */
export interface ServiceCreateOrUpdateState {
  zones: ParcelServiceZone[];
  isFetchingZones: boolean;

  isSubmittingZone: boolean;
  editingZone?: ParcelServiceZone;

  isSubmittingService: boolean;

  editParcelService?: ParcelService;
  isFetching: boolean;
}

export type ContainerState = ServiceCreateOrUpdateState;
