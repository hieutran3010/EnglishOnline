import React, { memo } from 'react';
import { Layout } from 'antd';
import Menu from './Menu';
import { IMenuItem } from './types';
const { Sider } = Layout;

interface LeftNavigation {
  isCollapsed: boolean;
  menus: IMenuItem[];
  appName?: string;
  onSelectedMenuChanged?: (key: string) => void;
  selectedMenuKeys?: string[];
}
const LeftNavigation = ({
  isCollapsed,
  menus,
  onSelectedMenuChanged,
  selectedMenuKeys,
}: LeftNavigation) => {
  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={isCollapsed}
      style={{
        overflow: 'auto',
        height: '100%',
        boxShadow:
          '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        position: 'fixed',
        minWidth: 200,
        maxWidth: 400,
        width: 'auto',
      }}
    >
      <Menu
        items={menus}
        onSelectedMenuChanged={onSelectedMenuChanged}
        selectedMenuKeys={selectedMenuKeys}
      />
    </Sider>
  );
};
export default memo(LeftNavigation);
