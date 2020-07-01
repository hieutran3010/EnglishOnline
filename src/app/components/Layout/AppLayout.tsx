import React, { useState, useCallback, memo } from 'react';
import { Layout } from 'antd';
import { LeftNavigation, TopNavigation } from 'app/components/AppNavigation';
import { MenuItem } from 'app/components/AppNavigation/index.d';
const { Content } = Layout;

const getMarginLeft = (enableMobileMode: boolean, collapsed: boolean) => {
  if (enableMobileMode) {
    return 20;
  }
  return collapsed ? 100 : 220;
};

interface AppLayout {
  menus: MenuItem[];
  logo: any;
  logoSmall: any;
  enableMobileMode: boolean;
  forceCollapse?: boolean;
  renderTopLeftComponent?: () => React.Component;
  renderTopRightComponent?: () => React.Component;
}
const AppLayout = ({
  menus,
  logo,
  logoSmall,
  enableMobileMode,
  forceCollapse,
  renderTopLeftComponent,
  renderTopRightComponent,
  ...restProps
}: AppLayout | any) => {
  const [collapsed, setCollapsed] = useState(false);

  const onCollapse = useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed]);

  const { children } = restProps;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <TopNavigation
        enableMobileMode={enableMobileMode}
        isCollapsed={collapsed}
        onCollapse={onCollapse}
        menus={menus}
        logo={logo}
        logoSmall={logoSmall}
        forceCollapse={forceCollapse}
        renderLeftComponent={renderTopLeftComponent}
        renderRightComponent={renderTopRightComponent}
      />

      <Layout style={{ marginTop: 64 }}>
        {!enableMobileMode && (
          <LeftNavigation
            isCollapsed={collapsed}
            menus={menus}
            forceCollapse={forceCollapse}
          />
        )}
        <Content
          className="site-layout-background"
          style={{
            marginLeft: getMarginLeft(
              enableMobileMode,
              collapsed || forceCollapse,
            ),
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
