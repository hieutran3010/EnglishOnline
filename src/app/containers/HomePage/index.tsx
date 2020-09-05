/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 *
 */

import React, { useEffect, useCallback, useState } from 'react';
import { Route, Switch, useHistory, Redirect } from 'react-router-dom';
import { Spin } from 'antd';
import find from 'lodash/fp/find';
import isEmpty from 'lodash/fp/isEmpty';

import { MenuItem } from 'app/components/AppNavigation/index.d';
import { AppLayout } from 'app/components/Layout';
import { authService, authStorage } from 'app/services/auth';
import { Role } from 'app/models/user';
import { getScreenMode } from 'app/components/AppNavigation';
import { useInjectReducer } from 'utils/redux-injectors';
import { useSelector, useDispatch } from 'react-redux';

import { VendorList } from '../VendorAndService/VendorList/Loadable';
import { VendorCreation } from '../VendorAndService/VendorCreation/Loadable';
import { VendorQuotation } from '../VendorAndService/VendorQuotation/Loadable';
import { VendorQuotationDetail } from '../VendorAndService/VendorQuotationDetail/Loadable';
import { VendorDetail } from '../VendorAndService/VendorDetail/Loadable';
import { CustomerList } from '../Customer/CustomerList/Loadable';
import { CustomerCreateOrUpdatePage } from '../Customer/CustomerCreateOrUpdatePage/Loadable';
import { Workspace } from '../BillAndWorkspace/Workspace/Loadable';
import { BillsInMonth } from '../BillAndWorkspace/BillsInMonth/Loadable';
import { UserList } from '../Auth/UserList/Loadable';
import { UserCreateOrUpdatePage } from '../Auth/UserCreateOrUpdatePage/Loadable';
import { Login } from '../Auth/Login/Loadable';
import { EmailVerification } from '../Auth/EmailVerification/Loadable';
import { BillAdvanceSearch } from '../BillAndWorkspace/BillAdvanceSearch/Loadable';
import UserNavigation from './UserNavigation';
import { BillReport } from '../BillAndWorkspace/BillReport/Loadable';
import { UserProfile } from '../Auth/UserProfile/Loadable';
import { Setting } from '../Setting/Loadable';
import { reducer, actions, sliceKey } from './slice';
import { selectScreenMode, selectCollapsedMenu } from './selectors';
import { BillUpdating } from '../BillAndWorkspace/BillUpdating/Loadable';
import { BillDeliveryHistoryPage } from '../BillAndWorkspace/BillDeliveryHistory/Loadable';
import { ServiceList } from '../VendorAndService/ServiceList/Loadable';
import { ServiceCreateOrUpdate } from '../VendorAndService/ServiceCreateOrUpdate/Loadable';
import { useMenu } from './hooks';
import { QuickQuotation } from '../BillAndWorkspace/QuickQuotation/Loadable';

const logo = require('assets/logo.png');
const logoSmall = require('assets/logo-compact.png');

export function HomePage() {
  const history = useHistory();
  const dispatch = useDispatch();

  useInjectReducer({ key: sliceKey, reducer });

  const screenMode = useSelector(selectScreenMode);
  const collapsedMenu = useSelector(selectCollapsedMenu);

  const [isVerifiedAuth, setIsVerifiedAuth] = useState(false);

  const currentUserRole = authStorage.getRole();
  const { authorizedMenus, selectedMenuIndex, onSelectedMenuChanged } = useMenu(
    {
      role: currentUserRole,
    },
  );

  const onSizeChanged = useCallback(() => {
    dispatch(actions.setScreenMode(getScreenMode()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const menu = find((a: MenuItem) => a.index === selectedMenuIndex)(
      authorizedMenus,
    );

    if (menu && menu.childMenu && !isEmpty(menu.childMenu)) {
      return menu.childMenu;
    }

    return <></>;
  }, [authorizedMenus, selectedMenuIndex]);

  const onRenderUser = useCallback(() => {
    return <UserNavigation />;
  }, []);

  const onCollapsed = useCallback(() => {
    dispatch(actions.toggleCollapsedMenu());
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      menus={authorizedMenus}
      logo={logo}
      logoSmall={logoSmall}
      renderTopLeftComponent={onRenderTopLeftMenu}
      screenMode={screenMode}
      renderTopRightComponent={onRenderUser}
      isCollapsed={collapsedMenu}
      onCollapsed={onCollapsed}
      onSelectedMenuChanged={onSelectedMenuChanged}
      selectedMenuKeys={[`${selectedMenuIndex}`]}
    >
      <Switch>
        <Route exact path="/">
          <Redirect to="/workspace" />
        </Route>
        <Route
          breadcrumbName="Bàn Làm Việc"
          exact
          path="/workspace"
          component={Workspace}
        />
        <Route
          breadcrumbName="Danh sách Bill trong tháng"
          exact
          path="/workspace/billsInMonth"
          component={BillsInMonth}
        />
        <Route
          breadcrumbName="Báo giá nhanh"
          exact
          path="/workspace/quickQuotation"
          component={QuickQuotation}
        />
        <Route
          breadcrumbName="NCC & Dịch Vụ"
          exact
          path="/vendors-and-services"
        >
          <Redirect to="/vendors-and-services/vendors" />
        </Route>
        <Route
          breadcrumbName="Quản lý Nhà Cung Cấp"
          exact
          path="/vendors-and-services/vendors"
          component={VendorList}
        />
        <Route
          breadcrumbName="Quản lý Dịch Vụ"
          exact
          path="/vendors-and-services/services"
          component={ServiceList}
        />

        <Route
          breadcrumbName="Thêm dịch vụ mới"
          exact
          path="/serviceCreation"
          component={ServiceCreateOrUpdate}
        />

        <Route
          breadcrumbName="Cập nhật dịch vụ"
          exact
          path="/serviceUpdating/:serviceId"
          component={ServiceCreateOrUpdate}
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
          path="/vendorUpdating/:vendorId"
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
          breadcrumbName="Cập nhật thông tin bill"
          exact
          path="/billUpdating/:billId"
          component={BillUpdating}
        />

        <Route
          breadcrumbName="Cập nhật tình trạng hàng"
          exact
          path="/billStatusUpdating/:billId"
          component={BillDeliveryHistoryPage}
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
