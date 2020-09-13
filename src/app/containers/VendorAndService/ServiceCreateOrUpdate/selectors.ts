import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'types';
import { initialState } from './slice';

const selectDomain = (state: RootState) =>
  state.serviceCreateOrUpdate || initialState;

export const selectZones = createSelector(
  [selectDomain],
  serviceCreateOrUpdateState => serviceCreateOrUpdateState.zones,
);

export const selectIsFetchingZones = createSelector(
  [selectDomain],
  serviceCreateOrUpdateState => serviceCreateOrUpdateState.isFetchingZones,
);

export const selectParcelService = createSelector(
  [selectDomain],
  serviceCreateOrUpdateState => serviceCreateOrUpdateState.editParcelService,
);

export const selectIsSubmittingZone = createSelector(
  [selectDomain],
  serviceCreateOrUpdateState => serviceCreateOrUpdateState.isSubmittingZone,
);

export const selectEditingZone = createSelector(
  [selectDomain],
  serviceCreateOrUpdateState => serviceCreateOrUpdateState.editingZone,
);
