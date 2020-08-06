import { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from 'utils/@reduxjs/toolkit';
import { getScreenMode, ScreenMode } from 'app/components/AppNavigation';

import { ContainerState } from './types';

const initScreenMode = getScreenMode();
// The initial state of the CustomerCreateOrUpdatePage container
export const initialState: ContainerState = {
  screenMode: initScreenMode,
  collapsedMenu: initScreenMode !== ScreenMode.FULL,
};

const homepageSlice = createSlice({
  name: 'homepage',
  initialState,
  reducers: {
    setScreenMode(state, action: PayloadAction<ScreenMode>) {
      state.screenMode = action.payload;
    },
    toggleCollapsedMenu(state) {
      state.collapsedMenu = !state.collapsedMenu;
    },
  },
});
export const { actions, reducer, name: sliceKey } = homepageSlice;
