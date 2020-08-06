import LeftNavigation from './LeftNavigation';
import TopNavigation from './TopNavigation';
import MobileMenu from './MobileMenu';
import { ScreenMode } from './types';

const getScreenMode = (): ScreenMode => {
  if (window.innerWidth <= 760) {
    return ScreenMode.MOBILE;
  }

  if (window.innerWidth <= 1440) {
    return ScreenMode.TABLET;
  }

  return ScreenMode.FULL;
};

export { LeftNavigation, TopNavigation, MobileMenu, ScreenMode, getScreenMode };
