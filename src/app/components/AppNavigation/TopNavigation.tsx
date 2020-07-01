import React, { memo } from 'react';
import { Layout } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import MobileMenu from './MobileMenu';
import { MenuItem } from './index.d';
import { StyledLogoWrapper } from './styles/StyledTopNavigation';

const { Header } = Layout;
interface TopNavigation {
  isCollapsed: boolean;
  onCollapse: () => void;
  enableMobileMode: boolean;
  menus: MenuItem[];
  logo: any;
  logoSmall: any;
  forceCollapse?: boolean;
  renderLeftComponent?: () => React.Component;
  renderRightComponent?: () => React.Component;
}
const TopNavigation = ({
  isCollapsed,
  onCollapse,
  enableMobileMode,
  menus,
  logoSmall,
  logo,
  forceCollapse,
  renderLeftComponent,
  renderRightComponent,
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
          src={isCollapsed || forceCollapse ? logoSmall : logo}
          height="40px"
          style={{ marginLeft: 20 }}
          alt=""
        />
      </StyledLogoWrapper>

      {!enableMobileMode && !forceCollapse ? (
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
