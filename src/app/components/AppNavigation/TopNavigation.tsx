import React, { memo } from 'react';
import { Layout } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import MobileMenu from './MobileMenu';
import { MenuItem } from './index.d';
import { StyledLogoWrapper } from './styles/StyledTopNavigation';
import { ScreenMode } from './types';

const { Header } = Layout;
interface TopNavigation {
  isCollapsed: boolean;
  onCollapse: () => void;
  menus: MenuItem[];
  logo: any;
  logoSmall: any;
  screenMode: ScreenMode;
  renderLeftComponent?: () => React.Component;
  renderRightComponent?: () => React.Component;
}
const TopNavigation = ({
  isCollapsed,
  onCollapse,
  menus,
  logoSmall,
  logo,
  renderLeftComponent,
  renderRightComponent,
  screenMode,
}: TopNavigation) => {
  return (
    <Header
      className="site-layout-background"
      style={{
        padding: 0,
        boxShadow:
          '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        zIndex: 1,
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        position: 'fixed',
      }}
    >
      <StyledLogoWrapper className="logo">
        <img
          src={isCollapsed ? logoSmall : logo}
          height="40px"
          style={{ marginLeft: 20 }}
          alt=""
        />
      </StyledLogoWrapper>

      {screenMode === ScreenMode.FULL ? (
        React.createElement(
          isCollapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
          {
            className: 'trigger',
            onClick: onCollapse,
            style: {
              fontSize: 18,
              marginLeft: isCollapsed ? 24 : 80,
              color: '#00a651',
            },
          },
        )
      ) : (
        <MobileMenu menus={menus} />
      )}
      <div>{renderLeftComponent && renderLeftComponent()}</div>
      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'flex-end',
          paddingRight: 20,
        }}
      >
        {renderRightComponent && renderRightComponent()}
      </div>
    </Header>
  );
};

export default memo(TopNavigation);
