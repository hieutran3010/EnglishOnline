import React from 'react';
import { Dropdown } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import Menu from './Menu';
import { MenuItem } from './index.d';

interface MobileMenu {
  menus: MenuItem[];
}
const MobileMenu = ({ menus }: MobileMenu) => (
  <Dropdown overlay={<Menu items={menus} />}>
    {React.createElement(MenuOutlined, {
      className: 'trigger',
      style: {
        fontSize: 18,
        marginLeft: 10,
        color: 'white',
      },
    })}
  </Dropdown>
);

export default MobileMenu;
