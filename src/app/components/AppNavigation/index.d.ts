import { ReactElement } from 'react';
import { Role } from 'app/models/user';

export declare interface MenuItem {
  index: number;
  icon: ReactElement;
  path: string;
  displayName: string;
  allowRoles?: Role[];
}
