import React, { memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import map from 'lodash/fp/map';
import toNumber from 'lodash/fp/toNumber';
import { Menu as AntMenu } from 'antd';
import { MenuItem } from './index.d';

interface Menu {
  items: MenuItem[];
  onSelectedMenuChanged?: (index: number) => void;
  selectedMenuKeys?: string[];
}
const Menu = ({ items, onSelectedMenuChanged, selectedMenuKeys }: Menu) => {
  const onSelect = useCallback(
    ({ key }) => {
      const index = toNumber(key);

      onSelectedMenuChanged && onSelectedMenuChanged(index);
    },
    [onSelectedMenuChanged],
  );

  return (
    <AntMenu
      theme="light"
      mode="inline"
      onSelect={onSelect}
      selectedKeys={selectedMenuKeys}
    >
      {map((menu: MenuItem) => (
        <AntMenu.Item key={menu.index} icon={menu.icon}>
          <Link to={menu.path}>{menu.displayName}</Link>
        </AntMenu.Item>
      ))(items)}
    </AntMenu>
  );
};
export default memo(Menu);
