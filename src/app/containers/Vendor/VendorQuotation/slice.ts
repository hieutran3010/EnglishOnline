import { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from 'utils/@reduxjs/toolkit';
import forEach from 'lodash/fp/forEach';
import map from 'lodash/fp/map';
import unionBy from 'lodash/fp/unionBy';
import flatten from 'lodash/fp/flatten';

import { ExcludedCountry } from 'app/components/Select/CountrySelect';
import Vendor from 'app/models/vendor';
import Zone from 'app/models/zone';

import { ContainerState } from './types';

// The initial state of the VendorQuotationCu container
export const initialState: ContainerState = {
  vendor: new Vendor(),
  isFetchingVendor: false,
  isSubmittingZone: false,
  mappedCountries: [],
  zones: [],
  isFetchingZones: false,
  isSubmitEditingVendor: false,
};

const vendorQuotationSlice = createSlice({
  name: 'vendorQuotation',
  initialState,
  reducers: {
    fetchVendor(state, action: PayloadAction<string>) {},
    fetchVendorCompleted(state, action: PayloadAction<Vendor>) {
      state.vendor = action.payload;
    },
    indicateIsFetchingVendor(state, action: PayloadAction<boolean>) {
      state.isFetchingVendor = action.payload;
    },

    fetchZones(state, action: PayloadAction<string>) {},
    fetchZonesCompleted(state, action: PayloadAction<Zone[]>) {
      state.zones = action.payload;
      state.mappedCountries = cacheMappedCountries(state, action.payload);
    },
    indicateIsFetchingZones(state, action: PayloadAction<boolean>) {
      state.isFetchingZones = action.payload;
    },

    indicateIsSubmittingZone(state, action: PayloadAction<boolean>) {
      state.isSubmittingZone = action.payload;
    },
    submitANewZone(state, action: PayloadAction<Zone>) {},
    deleteZone(state, action: PayloadAction<Zone>) {},
    updateZone(state, action: PayloadAction<Zone>) {},

    indicateIsEditingVendor(state, action: PayloadAction<boolean>) {
      state.isSubmitEditingVendor = action.payload;
    },
    updateVendor(state, action: PayloadAction<Vendor>) {},
  },
});

export const { actions, reducer, name: sliceKey } = vendorQuotationSlice;

const cacheMappedCountries = (state, zones: Zone[]) => {
  const newExcludedCountries = map((zone: Zone) => {
    const { countries, name } = zone;
    const convertedExcludedCountries: ExcludedCountry[] = [];

    forEach((country: string) => {
      convertedExcludedCountries.push({ country: country, reason: name });
    })(countries);

    return convertedExcludedCountries;
  })(zones);

  return unionBy(
    'country',
    flatten(newExcludedCountries),
    state.mappedCountries,
  );
};
