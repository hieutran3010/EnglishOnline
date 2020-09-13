import React, { memo, useMemo } from 'react';
import { Layout } from 'antd';
import {
  LeftNavigation,
  TopNavigation,
  ScreenMode,
} from 'app/components/AppNavigation';
import { MenuItem } from 'app/components/AppNavigation/index.d';
const { Content } = Layout;

export const getMarginLeft = (screenMode: ScreenMode, collapsed: boolean) => {
  if (screenMode === ScreenMode.MOBILE) {
    return 20;
  }

  if (screenMode === ScreenMode.FULL) {
    return collapsed ? 100 : 220;
  }

  return 100;
};

interface AppLayout {
  menus: MenuItem[];
  logo: any;
  logoSmall: any;
  screenMode: ScreenMode;
  isCollapsed: boolean;
  onCollapsed: () => void;
  renderTopLeftComponent?: () => React.Component;
  renderTopRightComponent?: () => React.Component;
  onSelectedMenuChanged?: (index: number) => void;
  selectedMenuKeys?: string[];
}
const AppLayout = ({
  menus,
  logo,
  logoSmall,
  screenMode,
  isCollapsed,
  renderTopLeftComponent,
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

  const { children } = restProps;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <TopNavigation
        isCollapsed={_isCollapsed}
        onCollapse={onCollapsed}
        menus={menus}
        logo={logo}
        logoSmall={logoSmall}
        renderLeftComponent={renderTopLeftComponent}
        renderRightComponent={renderTopRightComponent}
        screenMode={screenMode}
      />

      <Layout style={{ marginTop: 64 }}>
        {screenMode !== ScreenMode.MOBILE && (
          <LeftNavigation
            isCollapsed={_isCollapsed}
            menus={menus}
            onSelectedMenuChanged={onSelectedMenuChanged}
            selectedMenuKeys={selectedMenuKeys}
          />
        )}
        <Content
          className="site-layout-background"
          style={{
            marginLeft: getMarginLeft(screenMode, _isCollapsed),
            marginTop: 74,
            marginBottom: 20,
            marginRight: 20,
            bottom: 0,
            top: 0,
            position: 'fixed',
            right: 0,
            left: 0,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default memo(AppLayout);
