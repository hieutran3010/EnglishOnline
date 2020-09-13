import { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from 'utils/@reduxjs/toolkit';
import findIndex from 'lodash/fp/findIndex';
import remove from 'lodash/fp/remove';

import Vendor, { ServiceAssignmentResult } from 'app/models/vendor';
import Zone from 'app/models/zone';

import { ContainerState } from './types';
import ParcelService from 'app/models/parcelService';
import { isEmpty } from 'lodash';

// The initial state of the VendorQuotationCu container
export const initialState: ContainerState = {
  vendor: new Vendor(),
  isFetchingVendor: false,
  isSubmittingZone: false,
  zones: [],
  isFetchingZones: false,
  isSubmitEditingVendor: false,
  parcelServices: [],
  isFetchingParcelServices: false,

  isFetchingAssignedParcelServices: false,
  assignedParcelServices: [],
  isSubmittingSelectedServices: false,
};

const vendorQuotationSlice = createSlice({
  name: 'vendorQuotation',
  initialState,
  reducers: {
    fetchVendor(state, action: PayloadAction<string>) {},
    fetchVendorCompleted(state, action: PayloadAction<Vendor>) {
      state.vendor = action.payload;
    },
    fetchAssignedServices(state, action: PayloadAction<string>) {
      state.isFetchingAssignedParcelServices = true;
    },
    setAssignedParcelServices(state, action: PayloadAction<string[]>) {
      state.assignedParcelServices = action.payload;
      state.isFetchingAssignedParcelServices = false;
    },
    indicateIsFetchingVendor(state, action: PayloadAction<boolean>) {
      state.isFetchingVendor = action.payload;
    },

    fetchZones(state, action: PayloadAction<string>) {},
    fetchZonesCompleted(state, action: PayloadAction<Zone[]>) {
      state.zones = action.payload;
    },
    indicateIsFetchingZones(state, action: PayloadAction<boolean>) {
      state.isFetchingZones = action.payload;
    },

    indicateIsSubmittingZone(state, action: PayloadAction<boolean>) {
      state.isSubmittingZone = action.payload;
    },
    setEditingZone(state, action: PayloadAction<Zone | undefined>) {
      state.editingZone = action.payload;
    },
    addOrUpdateZone(state, action: PayloadAction<Zone>) {},
    addOrUpdateZoneCompleted(
      state,
      action: PayloadAction<{
        zone: Zone | undefined;
        isUpdate: boolean;
      }>,
    ) {
      const { zone, isUpdate } = action.payload;
      state.editingZone = zone;
      if (zone) {
        if (isUpdate === true) {
          const itemIndex = findIndex((z: Zone) => z.id === zone.id)(
            state.zones,
          );
          if (itemIndex >= 0) {
            state.zones.splice(itemIndex, 1, zone);
          }
        } else {
          state.zones.push(zone);
        }
      }
    },
    deleteZone(state, action: PayloadAction<Zone>) {},
    deleteZoneCompleted(state, action: PayloadAction<string>) {
      const zoneId = action.payload;
      state.zones = remove((z: Zone) => z.id === zoneId)(state.zones);
    },

    indicateIsEditingVendor(state, action: PayloadAction<boolean>) {
      state.isSubmitEditingVendor = action.payload;
    },
    updateVendor(state, action: PayloadAction<Vendor>) {},
    fetchParcelServices(state) {
      state.isFetchingParcelServices = true;
    },
    fetchParcelServicesCompleted(
      state,
      action: PayloadAction<ParcelService[]>,
    ) {
      state.parcelServices = action.payload;
      state.isFetchingParcelServices = false;
    },
    setIsSubmittingSelectedService(state, action: PayloadAction<boolean>) {
      state.isSubmittingSelectedServices = action.payload;
    },
    submitSelectedServices(state, action: PayloadAction<string[]>) {},
    submitSelectedServicesComplete(
      state,
      action: PayloadAction<{
        selectedServiceIds: string[];
        result: ServiceAssignmentResult;
      }>,
    ) {
      const { selectedServiceIds, result } = action.payload;
      const { newZones, deletedZoneIds } = result;

      state.assignedParcelServices = selectedServiceIds;
      if (!isEmpty(newZones)) {
        state.zones = state.zones.concat(newZones);
      }
      if (!isEmpty(deletedZoneIds)) {
        state.zones = remove((z: Zone) => deletedZoneIds.includes(z.id))(
          state.zones,
        );
      }
    },
  },
});

export const { actions, reducer, name: sliceKey } = vendorQuotationSlice;
