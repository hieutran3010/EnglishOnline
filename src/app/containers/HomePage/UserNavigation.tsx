import React, { memo, useMemo, useCallback } from 'react';
import { Avatar, Dropdown, Menu, Divider, Space } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import toString from 'lodash/fp/toString';

import { authService, authStorage } from 'app/services/auth';
import { showConfirm } from 'app/components/Modal/utils';

const UserNavigation = () => {
  const user = authStorage.getUser();

  const onSignOut = useCallback(() => {
    showConfirm(
      'Bạn có chắc đã lưu hết dữ liệu và muốn thoát khỏi hệ thống?',
      () => authService.logout(),
    );
  }, []);

  const menu = useMemo(() => {
    return (
      <Menu>
        <Menu.Item key={1}>
          <Link to="/userProfile">Thông Tin Tài Khoản</Link>
        </Menu.Item>
        <Menu.Item key={2}>
          <Divider style={{ margin: 0 }} />
        </Menu.Item>
        <Menu.Item key={3} danger onClick={onSignOut}>
          <Space>
            <LogoutOutlined style={{ marginBottom: 6 }} />
            <span>Đăng Xuất</span>
          </Space>
        </Menu.Item>
      </Menu>
    );
  }, [onSignOut]);

  return (
    <div>
      <Dropdown overlay={menu}>
        <Space>
          <div style={{ display: 'flex' }}>
            <span>&nbsp;-&nbsp;</span>
            <span>{user.displayName}</span>
          </div>
          <Avatar icon={<UserOutlined />} />
        </Space>
      </Dropdown>
    </div>
  );
};

export default memo(UserNavigation);
