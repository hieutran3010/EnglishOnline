import { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from 'utils/@reduxjs/toolkit';
import { ContainerState } from './types';
import ParcelService, { ParcelServiceZone } from 'app/models/parcelService';
import findIndex from 'lodash/fp/findIndex';
import remove from 'lodash/fp/remove';

// The initial state of the ServiceCreateOrUpdate container
export const initialState: ContainerState = {
  isFetchingZones: false,
  zones: [],
  isSubmittingZone: false,

  isSubmittingService: false,
  isFetching: false,
};

const serviceCreateOrUpdateSlice = createSlice({
  name: 'serviceCreateOrUpdate',
  initialState,
  reducers: {
    fetchZones(state, action: PayloadAction<string>) {
      state.isFetchingZones = true;
    },
    fetchZonesCompleted(state, action: PayloadAction<ParcelServiceZone[]>) {
      state.zones = action.payload;
      state.isFetchingZones = false;
    },
    setIsSubmittingService(state, action: PayloadAction<boolean>) {
      state.isSubmittingService = action.payload;
    },
    createNewService(
      state,
      action: PayloadAction<{ serviceData: any; history: any }>,
    ) {},
    updateService(state, action: PayloadAction<any>) {},
    updateServiceCompleted(state, action: PayloadAction<ParcelService>) {
      state.editParcelService = action.payload;
    },

    fetchParcelService(state, action: PayloadAction<string>) {
      state.isFetching = true;
    },
    fetchParcelServiceCompleted(
      state,
      action: PayloadAction<ParcelService | undefined>,
    ) {
      state.editParcelService = action.payload;
      state.isFetching = false;
    },
    setIsSubmittingZone(state, action: PayloadAction<boolean>) {
      state.isSubmittingZone = action.payload;
    },
    setEditingZone(
      state,
      action: PayloadAction<ParcelServiceZone | undefined>,
    ) {
      state.editingZone = action.payload;
    },
    addOrUpdateZone(state, action: PayloadAction<ParcelServiceZone>) {},
    addOrUpdateZoneCompleted(
      state,
      action: PayloadAction<{
        zone: ParcelServiceZone | undefined;
        isUpdate: boolean;
      }>,
    ) {
      const { zone, isUpdate } = action.payload;
      state.editingZone = zone;
      if (zone) {
        if (isUpdate === true) {
          const itemIndex = findIndex(
            (z: ParcelServiceZone) => z.id === zone.id,
          )(state.zones);
          if (itemIndex >= 0) {
            state.zones.splice(itemIndex, 1, zone);
          }
        } else {
          state.zones.push(zone);
        }
      }
    },
    deleteZone(state, action: PayloadAction<ParcelServiceZone>) {},
    deleteZoneCompleted(state, action: PayloadAction<string>) {
      const zoneId = action.payload;
      state.zones = remove((z: ParcelServiceZone) => z.id === zoneId)(
        state.zones,
      );
    },
    resetState(state) {
      state.editParcelService = undefined;
      state.editingZone = undefined;
      state.zones = [];
    },
  },
});

export const { actions, reducer, name: sliceKey } = serviceCreateOrUpdateSlice;
