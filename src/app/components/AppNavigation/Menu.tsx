import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import map from 'lodash/fp/map';
import { Menu as AntMenu } from 'antd';
import { MenuItem } from './index.d';

interface Menu {
  items: MenuItem[];
}
const Menu = ({ items }: Menu) => (
  <AntMenu theme="light" mode="inline" defaultSelectedKeys={['1']}>
    {map((menu: MenuItem) => (
      <AntMenu.Item key={menu.index} icon={menu.icon}>
        <Link to={menu.path}>{menu.displayName}</Link>
      </AntMenu.Item>
    ))(items)}
  </AntMenu>
);
export default memo(Menu);
