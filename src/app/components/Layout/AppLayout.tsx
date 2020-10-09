import React, { memo, useCallback, useMemo, useState } from 'react';
import { Layout } from 'antd';
import {
  LeftNavigation,
  TopNavigation,
  ScreenMode,
} from 'app/components/AppNavigation';
import { IMenuItem } from 'app/components/AppNavigation/types';
import DrawerMenu from '../AppNavigation/DrawerMenu';
import Logo from '../Logo';
const { Content } = Layout;

export const getMarginLeft = (screenMode: ScreenMode, collapsed: boolean) => {
  if (screenMode === ScreenMode.MOBILE) {
    return 20;
  }

  if (screenMode === ScreenMode.FULL) {
    return collapsed ? 100 : 211;
  }

  return 100;
};

interface AppLayout {
  menus: IMenuItem[];
  logo: any;
  logoSmall: any;
  screenMode: ScreenMode;
  isCollapsed: boolean;
  onCollapsed: () => void;
  renderTopRightComponent?: () => React.Component;
  onSelectedMenuChanged?: (key: string) => void;
  selectedMenuKeys?: string[];
}
const AppLayout = ({
  menus,
  logo,
  logoSmall,
  screenMode,
  isCollapsed,
  renderTopRightComponent,
  onCollapsed,
  onSelectedMenuChanged,
  selectedMenuKeys,
  ...restProps
}: AppLayout | any) => {
  const _isCollapsed = useMemo(() => {
    if (screenMode !== ScreenMode.FULL) {
      return true;
    }

    return isCollapsed;
  }, [isCollapsed, screenMode]);

  const [visibleDrawer, setVisibleDrawer] = useState(false);

  const _onDrawerSelectedMenuChanged = useCallback(
    (key: string) => {
      setVisibleDrawer(false);

      onSelectedMenuChanged(key);
    },
    [onSelectedMenuChanged],
  );

  const onShowDrawer = useCallback(() => {
    setVisibleDrawer(true);
  }, []);

  const onCloseDrawer = useCallback(() => {
    setVisibleDrawer(false);
  }, []);

  const { children } = restProps;

  return (
    <Layout style={{ height: '100%' }}>
      <TopNavigation
        isCollapsed={_isCollapsed}
        onCollapse={onCollapsed}
        menus={menus}
        logo={logo}
        logoSmall={logoSmall}
        renderRightComponent={renderTopRightComponent}
        screenMode={screenMode}
        onShowDrawer={onShowDrawer}
      />

      <Layout>
        {screenMode !== ScreenMode.MOBILE ? (
          <LeftNavigation
            isCollapsed={_isCollapsed}
            menus={menus}
            onSelectedMenuChanged={onSelectedMenuChanged}
            selectedMenuKeys={selectedMenuKeys}
          />
        ) : (
          <DrawerMenu
            items={menus}
            onSelectedMenuChanged={_onDrawerSelectedMenuChanged}
            selectedMenuKeys={selectedMenuKeys}
            visible={visibleDrawer}
            onClose={onCloseDrawer}
            header={<Logo logoSrc={logo} height={35} />}
          />
        )}

        <Content
          style={{
            marginRight: 20,
            marginTop: 20,
            marginBottom: 20,
            marginLeft: getMarginLeft(screenMode, _isCollapsed),
            display: 'flex',
          }}
        >
          <div style={{ flex: 'auto', width: '100%' }}>{children}</div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default memo(AppLayout);
