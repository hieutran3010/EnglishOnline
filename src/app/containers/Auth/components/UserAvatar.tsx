import React, { memo, useState, useEffect } from 'react';
import { Popover, Avatar, Spin } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { PopoverProps } from 'antd/lib/popover';
import User from 'app/models/user';
import { authService } from 'app/services/auth';
import { AvatarProps } from 'antd/lib/avatar';

interface Props {
  title?: string;
  userId?: string;
}
const UserAvatar = ({
  title,
  userId,
  ...restProps
}: Props & PopoverProps & AvatarProps) => {
  const { placement } = restProps;

  const [user, setUser] = useState<User>();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function getUserAsync() {
      setLoading(true);
      const c = await authService.getUserById(userId);
      setUser(c);
      setLoading(false);
    }

    getUserAsync();
  }, [userId]);

  return (
    <Popover
      title={title}
      placement={placement || 'left'}
      content={<span>{user?.displayName}</span>}
    >
      {loading ? (
        <Spin size="small" />
      ) : (
        <Avatar
          icon={<UserOutlined />}
          size="small"
          src={user?.avatarUrl}
          {...restProps}
        />
      )}
    </Popover>
  );
};

export default memo(UserAvatar);
