import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  TeamOutlined,
  SmileOutlined,
  RadarChartOutlined,
  LaptopOutlined,
  FileSearchOutlined,
  FundOutlined,
  SettingOutlined,
  DesktopOutlined,
  ContainerOutlined,
  ClusterOutlined,
  DeploymentUnitOutlined,
  FileDoneOutlined,
} from '@ant-design/icons';
import filter from 'lodash/fp/filter';
import find from 'lodash/fp/find';
import isEmpty from 'lodash/fp/isEmpty';
import some from 'lodash/fp/some';

import { useLocation } from 'react-router-dom';
import { Role } from 'app/models/user';
import { IMenuItem } from 'app/components/AppNavigation/types';
import map from 'lodash/fp/map';

const DEFAULT_MENU = 'workspace';

const isValidMenuItemForPath = (menuItem: IMenuItem, path: string) => {
  return (
    menuItem.path === path ||
    some((ap: string) => path.startsWith(ap))(menuItem.activePaths)
  );
};

const useMenu = ({ role }) => {
  const location = useLocation();
  const { pathname } = location;

  const [selectedMenuKeys, setSelectedMenuKeys] = useState<string[]>([
    DEFAULT_MENU,
  ]);

  const authorizedMenus = useMemo((): IMenuItem[] => {
    const rawMenus: IMenuItem[] = [
      {
        displayName: 'Bàn Làm Việc',
        icon: <LaptopOutlined />,
        key: 'workCorner',
        order: 1,
        childMenu: [
          {
            path: '/workspace',
            key: DEFAULT_MENU,
            order: 1,
            displayName: 'Góc của Tôi',
            icon: <DesktopOutlined />,
          },
          {
            path: '/workspace/billsInMonth',
            key: 'billsInMonth',
            order: 2,
            displayName: 'Bill trong tháng',
            icon: <ContainerOutlined />,
            activePaths: ['/billUpdating', '/billStatusUpdating'],
          },
          {
            path: '/workspace/quickQuotation',
            key: 'quickQuotation',
            order: 3,
            displayName: 'Báo giá nhanh',
            icon: <FileDoneOutlined />,
            allowRoles: [Role.ADMIN, Role.SALE],
          },
        ],
      },
      {
        key: 'vendors-and-services',
        displayName: 'NCC & Dịch Vụ',
        icon: <RadarChartOutlined />,
        order: 2,
        childMenu: [
          {
            path: '/vendors-and-services/vendors',
            key: 'vendorList',
            order: 1,
            displayName: 'Nhà Cung Cấp',
            icon: <ClusterOutlined />,
            activePaths: [
              '/vendorCreation',
              '/vendorUpdating',
              '/vendorQuotation',
              '/vendorDetail',
              '/vendorQuotationDetail',
            ],
          },
          {
            path: '/vendors-and-services/services',
            key: 'serviceList',
            order: 2,
            displayName: 'Dịch Vụ',
            icon: <DeploymentUnitOutlined />,
            activePaths: ['/serviceCreation', '/serviceUpdating'],
          },
        ],
      },
      {
        path: '/customers',
        key: 'customerManagement',
        displayName: 'Quản Lý Khách Hàng',
        icon: <SmileOutlined />,
        order: 3,
        activePaths: ['/customerCreation', '/customerUpdating'],
      },
      {
        path: '/users',
        displayName: 'Quản Lý Người Dùng',
        icon: <TeamOutlined />,
        key: 'userManagement',
        order: 4,
        allowRoles: [Role.ADMIN],
        activePaths: ['/userUpdating', '/userCreation', '/userProfile'],
      },
      {
        path: '/billAdvanceSearch',
        key: 'billAdvancesearch',
        displayName: 'Tìm kiếm Bill',
        icon: <FileSearchOutlined />,
        order: 5,
      },
      {
        path: '/billReport',
        displayName: 'Báo Cáo',
        icon: <FundOutlined />,
        order: 6,
        key: 'billReport',
      },
      {
        path: '/setting',
        displayName: 'Cài Đặt',
        icon: <SettingOutlined />,
        order: 7,
        key: 'setting',
        allowRoles: [Role.ADMIN, Role.ACCOUNTANT],
      },
    ];

    const authorizedMenus = filter(
      (menuItem: IMenuItem) =>
        !menuItem.allowRoles ||
        (menuItem.allowRoles && menuItem.allowRoles?.includes(role)),
    )(rawMenus);

    return map((aMenu: IMenuItem) => {
      if (!isEmpty(aMenu.childMenu)) {
        aMenu.childMenu = filter((cMenu: IMenuItem) => {
          if (cMenu.canShow && !cMenu.canShow()) {
            return false;
          }

          if (isEmpty(cMenu.allowRoles)) {
            return true;
          }

          if (
            !isEmpty(cMenu.allowRoles) &&
            cMenu.allowRoles &&
            cMenu.allowRoles.includes(role)
          ) {
            return true;
          }

          return false;
        })(aMenu.childMenu);
      }

      return aMenu;
    })(authorizedMenus);
  }, [role]);

  useEffect(() => {
    let selectedMenuItem = find((item: IMenuItem) => {
      if (!isEmpty(item.childMenu)) {
        const adaptMenuItem = find((cMenu: IMenuItem) =>
          isValidMenuItemForPath(cMenu, pathname),
        )(item.childMenu);

        return !isEmpty(adaptMenuItem);
      }

      return isValidMenuItemForPath(item, pathname);
    })(authorizedMenus);

    let result = DEFAULT_MENU;
    if (selectedMenuItem) {
      if (selectedMenuItem.childMenu && !isEmpty(selectedMenuItem.childMenu)) {
        selectedMenuItem = find((cMenu: IMenuItem) =>
          isValidMenuItemForPath(cMenu, pathname),
        )(selectedMenuItem.childMenu);
      }
      result = selectedMenuItem?.key ?? DEFAULT_MENU;
    }

    setSelectedMenuKeys([result]);
  }, [authorizedMenus, pathname]);

  const onSelectedMenuChanged = useCallback((key: string) => {
    setSelectedMenuKeys([key]);
  }, []);

  return {
    authorizedMenus,
    selectedMenuKeys,
    onSelectedMenuChanged,
  };
};

export { useMenu };
