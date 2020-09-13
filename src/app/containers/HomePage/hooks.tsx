import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Menu } from 'antd';
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

import { MenuItem } from 'app/components/AppNavigation/index.d';
import { Link, useLocation } from 'react-router-dom';
import { Role } from 'app/models/user';

const useMenu = ({ role }) => {
  const location = useLocation();
  const { pathname } = location;

  const [selectedMenuIndex, setSelectedMenuIndex] = useState(1);

  const authorizedMenus = useMemo((): MenuItem[] => {
    const rawMenus = [
      {
        path: '/workspace',
        displayName: 'Bàn Làm Việc',
        icon: <LaptopOutlined />,
        index: 1,
        activePaths: ['billUpdating', 'billStatusUpdating'],
        childMenu: (
          <Menu mode="horizontal" selectedKeys={[pathname]}>
            <Menu.Item
              key="/workspace"
              icon={<DesktopOutlined />}
              style={{ borderBottom: 0 }}
            >
              <Link to="/workspace">Góc làm việc của Tôi</Link>
            </Menu.Item>
            <Menu.Item
              key="/workspace/billsInMonth"
              icon={<ContainerOutlined />}
              style={{ borderBottom: 0 }}
            >
              <Link to="/workspace/billsInMonth">
                Danh sách Bill trong tháng
              </Link>
            </Menu.Item>
            {[Role.SALE, Role.ADMIN].includes(role) && (
              <Menu.Item
                key="/workspace/quickQuotation"
                icon={<FileDoneOutlined />}
                style={{ borderBottom: 0 }}
              >
                <Link to="/workspace/quickQuotation">Báo giá nhanh</Link>
              </Menu.Item>
            )}
          </Menu>
        ),
      },
      {
        path: '/vendors-and-services',
        displayName: 'NCC & Dịch Vụ',
        icon: <RadarChartOutlined />,
        index: 2,
        activePaths: [
          'vendorCreation',
          'vendorUpdating',
          'serviceCreation',
          'serviceUpdating',
          'vendorQuotation',
          'vendorDetail',
          'vendorQuotationDetail',
        ],
        childMenu: (
          <Menu mode="horizontal" selectedKeys={[pathname]}>
            <Menu.Item
              key="/vendors-and-services/vendors"
              icon={<ClusterOutlined />}
              style={{ borderBottom: 0 }}
            >
              <Link to="/vendors-and-services/vendors">Nhà Cung Cấp</Link>
            </Menu.Item>
            <Menu.Item
              key="/vendors-and-services/services"
              icon={<DeploymentUnitOutlined />}
              style={{ borderBottom: 0 }}
            >
              <Link to="/vendors-and-services/services">Dịch Vụ</Link>
            </Menu.Item>
          </Menu>
        ),
      },
      {
        path: '/customers',
        displayName: 'Quản Lý Khách Hàng',
        icon: <SmileOutlined />,
        index: 3,
        activePaths: ['customerCreation', 'customerUpdating'],
      },
      {
        path: '/users',
        displayName: 'Quản Lý Người Dùng',
        icon: <TeamOutlined />,
        index: 4,
        allowRoles: [Role.ADMIN],
        activePaths: ['userUpdating', 'userCreation', 'userProfile'],
      },
      {
        path: '/billAdvanceSearch',
        displayName: 'Tìm kiếm Bill',
        icon: <FileSearchOutlined />,
        index: 5,
      },
      {
        path: '/billReport',
        displayName: 'Báo Cáo',
        icon: <FundOutlined />,
        index: 6,
      },
      {
        path: '/setting',
        displayName: 'Cài Đặt',
        icon: <SettingOutlined />,
        index: 7,
        allowRoles: [Role.ADMIN, Role.ACCOUNTANT],
      },
    ];

    return filter(
      (menuItem: MenuItem) =>
        !menuItem.allowRoles ||
        (menuItem.allowRoles && menuItem.allowRoles?.includes(role)),
    )(rawMenus);
  }, [pathname, role]);

  useEffect(() => {
    const selectedMenuItem = find((item: MenuItem) => {
      let activePaths = [item.path];
      if (item.activePaths && !isEmpty(item.activePaths)) {
        activePaths = activePaths.concat(item.activePaths);
      }
      return some((ap: string) => pathname.includes(ap))(activePaths);
    })(authorizedMenus);

    let result = 1;
    if (selectedMenuItem) {
      result = selectedMenuItem.index;
    }

    setSelectedMenuIndex(result);
  }, [authorizedMenus, pathname]);

  const onSelectedMenuChanged = useCallback((index: number) => {
    setSelectedMenuIndex(index);
  }, []);

  return { authorizedMenus, selectedMenuIndex, onSelectedMenuChanged };
};

export { useMenu };
