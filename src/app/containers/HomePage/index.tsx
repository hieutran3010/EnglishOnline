/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 *
 */

import React, { useEffect, useCallback, useState } from 'react';
import { Route, Switch, useHistory, Redirect } from 'react-router-dom';
import { Spin, Menu, Layout, Tooltip } from 'antd';
import {
  HomeOutlined,
  FileProtectOutlined,
  LogoutOutlined,
} from '@ant-design/icons';

import { authService, authStorage } from 'app/services/auth';
import { getScreenMode } from 'app/components/AppNavigation';
import { useInjectReducer } from 'utils/redux-injectors';
import { useSelector, useDispatch } from 'react-redux';
import { isMobile } from 'react-device-detect';

import { Login } from '../Auth/Login/Loadable';
import { EmailVerification } from '../Auth/EmailVerification/Loadable';
import { reducer, actions, sliceKey } from './slice';
import { Post } from '../Post/Loadable';
import Logo from 'app/components/Logo';

const logo = require('assets/logo.png');
const logoSmall = require('assets/logo-compact.png');

const { Header, Content } = Layout;

export function HomePage() {
  const history = useHistory();
  const dispatch = useDispatch();

  useInjectReducer({ key: sliceKey, reducer });

  const [isVerifiedAuth, setIsVerifiedAuth] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(['home']);

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

  const onMenuChanged = useCallback(e => {
    setSelectedMenu([e.key]);
  }, []);

  const onLogOut = useCallback(() => {
    authService.logout();
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
    <Layout style={{ height: '100%' }}>
      <Header style={{ padding: 0 }}>
        <Menu
          onClick={onMenuChanged}
          mode="horizontal"
          selectedKeys={selectedMenu}
          style={{ textAlign: 'center' }}
        >
          <Menu.Item key="home" icon={<HomeOutlined />}>
            Home
          </Menu.Item>
          <Menu.Item key="courses" icon={<FileProtectOutlined />}>
            Courses
          </Menu.Item>
        </Menu>
        <div style={{ position: 'fixed', top: 0 }}>
          <Logo isSmall={isMobile} logoSrc={logo} logoSmallSrc={logoSmall} />
        </div>
        <div style={{ position: 'fixed', top: -5, right: 15, fontSize: 25 }}>
          <Tooltip title="Thoát">
            <LogoutOutlined onClick={onLogOut} />
          </Tooltip>
        </div>
      </Header>
      <Content style={{ padding: 20, overflow: 'auto', marginTop: 2 }}>
        <Switch>
          <Route breadcrumbName="Posts" exact path="/" component={Post} />
        </Switch>
      </Content>
    </Layout>
  );
}
