import React, { memo } from 'react';
import { Button, Layout } from 'antd';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { StyledLogoWrapper } from './styles/StyledTopNavigation';
import { ScreenMode, IMenuItem } from './types';
import Logo from '../Logo';

const { Header } = Layout;
interface TopNavigation {
  isCollapsed: boolean;
  onCollapse: () => void;
  menus: IMenuItem[];
  logo: any;
  logoSmall: any;
  screenMode: ScreenMode;
  renderRightComponent?: () => React.Component;
  onShowDrawer?: () => void;
}
const TopNavigation = ({
  isCollapsed,
  onCollapse,
  logoSmall,
  logo,
  renderRightComponent,
  screenMode,
  onShowDrawer,
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
        position: 'sticky',
        top: 0,
      }}
    >
      <StyledLogoWrapper className="logo">
        {screenMode === ScreenMode.MOBILE ? (
          <Button
            type="primary"
            ghost
            icon={<MenuOutlined />}
            style={{ marginRight: 10 }}
            onClick={onShowDrawer}
          />
        ) : (
          <Logo isSmall={isCollapsed} logoSrc={logo} logoSmallSrc={logoSmall} />
        )}
      </StyledLogoWrapper>

      {screenMode === ScreenMode.FULL ??
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
        )}
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
