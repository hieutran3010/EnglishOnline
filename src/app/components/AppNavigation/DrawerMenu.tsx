import { Drawer } from 'antd';
import React, { memo } from 'react';
import Menu from './Menu';
import { IDrawerMenu } from './types';

const DrawerMenu = ({
  visible,
  header,
  onClose,
  ...restProps
}: IDrawerMenu) => {
  return (
    <Drawer
      placement="left"
      visible={visible}
      closable={false}
      onClose={onClose}
      title={header}
      bodyStyle={{ padding: 0 }}
      headerStyle={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Menu {...restProps} />
    </Drawer>
  );
};

export default memo(DrawerMenu);
