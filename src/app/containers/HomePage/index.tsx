/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 *
 */

import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import {
  TeamOutlined,
  SmileOutlined,
  RadarChartOutlined,
  LaptopOutlined,
  FileSearchOutlined,
  FundOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Spin } from 'antd';
import filter from 'lodash/fp/filter';

import { MenuItem } from 'app/components/AppNavigation/index.d';
import { AppLayout } from 'app/components/Layout';
import { authService, authStorage } from 'app/services/auth';
import { Role } from 'app/models/user';

import { VendorList } from '../Vendor/VendorList/Loadable';
import { VendorCreation } from '../Vendor/VendorCreation/Loadable';
import { VendorQuotation } from '../Vendor/VendorQuotation/Loadable';
import { VendorQuotationDetail } from '../Vendor/VendorQuotationDetail/Loadable';
import { VendorDetail } from '../Vendor/VendorDetail/Loadable';
import { CustomerList } from '../Customer/CustomerList/Loadable';
import { CustomerCreateOrUpdatePage } from '../Customer/CustomerCreateOrUpdatePage/Loadable';
import { Workspace } from '../BillAndWorkspace/Workspace/Loadable';
import { BillsInMonth } from '../BillAndWorkspace/BillsInMonth/Loadable';
import { UserList } from '../Auth/UserList/Loadable';
import { UserCreateOrUpdatePage } from '../Auth/UserCreateOrUpdatePage/Loadable';
import { Login } from '../Auth/Login/Loadable';
import { EmailVerification } from '../Auth/EmailVerification/Loadable';
import { BillAdvanceSearch } from '../BillAndWorkspace/BillAdvanceSearch/Loadable';
import ChildNavigation from './ChildNavigation';
import UserNavigation from './UserNavigation';
import { BillReport } from '../BillAndWorkspace/BillReport/Loadable';
import { UserProfile } from '../Auth/UserProfile/Loadable';
import { Setting } from '../Setting/Loadable';

const logo = require('assets/logo.png');
const logoSmall = require('assets/logo-compact.png');

const menus: MenuItem[] = [
  {
    path: '/',
    displayName: 'Bàn Làm Việc',
    icon: <LaptopOutlined />,
    index: 1,
  },
  {
    path: '/vendors',
    displayName: 'Quản Lý Nhà Cung Cấp',
    icon: <RadarChartOutlined />,
    index: 2,
  },
  {
    path: '/customers',
    displayName: 'Quản Lý Khách Hàng',
    icon: <SmileOutlined />,
    index: 3,
  },
  {
    path: '/users',
    displayName: 'Quản Lý Người Dùng',
    icon: <TeamOutlined />,
    index: 4,
    allowRoles: [Role.ADMIN],
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
  },
];

export function HomePage() {
  const history = useHistory();

  const [enableMobileMode, setEnableMobileMode] = useState(
    window.innerWidth <= 760,
  );

  const [forceCollapseMenu, setForceCollapseMenu] = useState(
    window.innerWidth <= 1440,
  );

  const [isVerifiedAuth, setIsVerifiedAuth] = useState(false);

  const currentUserRole = authStorage.getRole();
  const authorizedMenus = useMemo((): MenuItem[] => {
    return filter(
      (menuItem: MenuItem) =>
        !menuItem.allowRoles ||
        (menuItem.allowRoles && menuItem.allowRoles?.includes(currentUserRole)),
    )(menus);
  }, [currentUserRole]);

  const onSizeChanged = useCallback(() => {
    setEnableMobileMode(window.innerWidth <= 760);
    setForceCollapseMenu(window.innerWidth <= 1440);
  }, []);

  useEffect(() => {
    window.addEventListener('resize', onSizeChanged);
    return function cleanUp() {
      window.removeEventListener('resize', onSizeChanged);
    };
  }, [onSizeChanged]);

  useEffect(() => {
    const loginSubscriber = authService.onLoginSuccess.subscribe(
      (user: any) => {
        setIsVerifiedAuth(true);
        if (!user.emailVerified) {
          history.push('/emailVerification');
        }
      },
    );

    const logoutSubscriber = authService.onLogoutSuccess.subscribe(() => {
      setIsVerifiedAuth(false);
      history.push('/');
    });

    return function cleanUp() {
      loginSubscriber.unsubscribe();
      logoutSubscriber.unsubscribe();
    };
  }, [history]);

  const onRenderTopLeftMenu = useCallback(() => {
    return <ChildNavigation />;
  }, []);

  const onRenderUser = useCallback(() => {
    return <UserNavigation />;
  }, []);

  const isAuthenticated = authService.isAuthenticated();
  if (!isAuthenticated) {
    return (
      <Switch>
        <Route breadcrumbName="Đăng Nhập" exact path="/" component={Login} />
        <Route
          breadcrumbName="Xác Thực Email"
          exact
          path="/emailVerification"
          component={EmailVerification}
        />
      </Switch>
    );
  }

  if (!isVerifiedAuth) {
    return (
      <div
        style={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <AppLayout
      enableMobileMode={enableMobileMode}
      menus={authorizedMenus}
      logo={logo}
      logoSmall={logoSmall}
      forceCollapse={forceCollapseMenu}
      renderTopLeftComponent={onRenderTopLeftMenu}
      renderTopRightComponent={onRenderUser}
    >
      <Switch>
        <Route
          breadcrumbName="Bàn Làm Việc"
          exact
          path="/"
          component={Workspace}
        />
        <Route
          breadcrumbName="Quản lý Nhà Cung Cấp"
          exact
          path="/vendors"
          component={VendorList}
        />
        <Route
          breadcrumbName="Thêm nhà cung cấp mới"
          exact
          path="/vendorCreation"
          component={VendorCreation}
        />
        <Route
          breadcrumbName="Cập nhật thông tin Nhà cung cấp"
          exact
          path="/vendorCreation/:vendorId"
          component={VendorCreation}
        />
        <Route
          breadcrumbName="Phí & Zone"
          exact
          path="/vendorQuotation/:vendorId"
          component={VendorQuotation}
        />
        <Route
          breadcrumbName="Báo giá"
          exact
          path="/vendorQuotationDetail/:vendorId"
          component={VendorQuotationDetail}
        />
        <Route
          breadcrumbName="Thông tin chi tiết Nhà cung cấp"
          exact
          path="/vendorDetail/:vendorId"
          component={VendorDetail}
        />
        <Route
          breadcrumbName="Quản Lý Khách Hàng"
          exact
          path="/customers"
          component={CustomerList}
        />
        <Route
          breadcrumbName="Thêm Khách Hàng"
          exact
          path="/customerCreation"
          component={CustomerCreateOrUpdatePage}
        />
        <Route
          breadcrumbName="Cập nhật Khách Hàng"
          exact
          path="/customerUpdating/:customerId"
          component={CustomerCreateOrUpdatePage}
        />
        <Route
          breadcrumbName="Danh sách Bill trong tháng"
          exact
          path="/billsInMonth"
          component={BillsInMonth}
        />

        <Route
          breadcrumbName="Danh sách Người Dùng"
          exact
          path="/users"
          component={UserList}
        />
        <Route
          breadcrumbName="Thêm Người Dùng"
          exact
          path="/userCreation"
          component={UserCreateOrUpdatePage}
        />
        <Route
          breadcrumbName="Cập nhật Người Dùng"
          exact
          path="/userUpdating/:userId"
          component={UserCreateOrUpdatePage}
        />

        <Route
          breadcrumbName="Tìm kiếm Bill"
          exact
          path="/billAdvanceSearch"
          component={BillAdvanceSearch}
        />
        <Route
          breadcrumbName="Báo Cáo"
          exact
          path="/billReport"
          component={BillReport}
        />

        <Route
          breadcrumbName="Thông tin tài khoản"
          exact
          path="/userProfile"
          component={UserProfile}
        />

        {[Role.ADMIN, Role.ACCOUNTANT].includes(currentUserRole) && (
          <Route
            breadcrumbName="Cài Đặt"
            exact
            path="/setting"
            component={Setting}
          />
        )}
      </Switch>
    </AppLayout>
  );
}
