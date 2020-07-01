import React, { memo } from 'react';
import { Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { ContainerOutlined, HomeOutlined } from '@ant-design/icons';

const ChildNavigation = () => {
  const location = useLocation();
  const { pathname } = location;

  if (['/', '/billsInMonth'].includes(pathname)) {
    return (
      <Menu mode="horizontal" defaultSelectedKeys={[pathname]}>
        <Menu.Item key="/" icon={<HomeOutlined />} style={{ borderBottom: 0 }}>
          <Link to="/">Góc làm việc của Tôi</Link>
        </Menu.Item>
        <Menu.Item
          key="/billsInMonth"
          icon={<ContainerOutlined />}
          style={{ borderBottom: 0 }}
        >
          <Link to="/billsInMonth">Danh sách Bill trong tháng</Link>
        </Menu.Item>
      </Menu>
    );
  }

  return <></>;
};

export default memo(ChildNavigation);
