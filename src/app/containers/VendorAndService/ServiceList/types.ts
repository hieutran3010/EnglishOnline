import ParcelService from 'app/models/parcelService';

/* --- STATE --- */
export interface ServiceListState {
  services: ParcelService[];
  isWorkingOnServiceList: boolean;
}

export type ContainerState = ServiceListState;
