import React, { memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import map from 'lodash/fp/map';
import { Menu as AntMenu } from 'antd';
import { IMenu, IMenuItem } from './types';
import isEmpty from 'lodash/fp/isEmpty';

const { SubMenu } = AntMenu;

const Menu = ({ items, onSelectedMenuChanged, selectedMenuKeys }: IMenu) => {
  const onSelect = useCallback(
    ({ key }) => {
      onSelectedMenuChanged && onSelectedMenuChanged(key);
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
      {map((menu: IMenuItem) => {
        if (isEmpty(menu.childMenu)) {
          return (
            <AntMenu.Item key={menu.key} icon={menu.icon}>
              <Link to={menu.path || ''}>{menu.displayName}</Link>
            </AntMenu.Item>
          );
        }

        return (
          <SubMenu key={menu.key} icon={menu.icon} title={menu.displayName}>
            {map((child: IMenuItem) => {
              return (
                <AntMenu.Item key={child.key} icon={child.icon}>
                  <Link to={child.path || ''}>{child.displayName}</Link>
                </AntMenu.Item>
              );
            })(menu.childMenu)}
          </SubMenu>
        );
      })(items)}
    </AntMenu>
  );
};
export default memo(Menu);
