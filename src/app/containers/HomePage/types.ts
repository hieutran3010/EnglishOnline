import { ScreenMode } from 'app/components/AppNavigation';

/* --- STATE --- */
export interface HomepageState {
  screenMode: ScreenMode;
  collapsedMenu: boolean;
}

export type ContainerState = HomepageState;
