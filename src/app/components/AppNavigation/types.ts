import { Role } from 'app/models/user';
import { ReactElement } from 'react';

export enum ScreenMode {
  FULL = 'FULL',
  TABLET = 'TABLET',
  MOBILE = 'MOBILE',
}

export interface IMenuItem {
  key: string;
  order?: number;
  icon: ReactElement;
  path?: string;
  displayName: string;
  allowRoles?: Role[];
  activePaths?: string[];
  childMenu?: IMenuItem[];
  canShow?: () => boolean;
}

export interface IMenu {
  items: IMenuItem[];
  onSelectedMenuChanged?: (key: string) => void;
  selectedMenuKeys?: string[];
}

export interface IDrawerMenu extends IMenu {
  visible?: boolean;
  onClose?: () => void;
  header?: React.ReactNode;
}
