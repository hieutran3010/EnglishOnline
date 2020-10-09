import React, { memo, useState, useEffect } from 'react';
import { Popover, Avatar, Spin, Typography, Descriptions } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import isEmpty from 'lodash/fp/isEmpty';
import { PopoverProps } from 'antd/lib/popover';
import { AvatarProps } from 'antd/lib/avatar';

import User from 'app/models/user';
import { authService } from 'app/services/auth';

const { Text } = Typography;

interface Props {
  title?: string;
  userId?: string;
  type?: 'avatar' | 'displayName' | 'displayNameWithLabel';
}
const UserAvatar = ({
  title,
  userId,
  type,
  ...restProps
}: Props & PopoverProps & AvatarProps) => {
  const { placement } = restProps;

  const [user, setUser] = useState<User>();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let didCancel = false;
    async function getUserAsync() {
      if (isEmpty(userId)) {
        return;
      }

      setLoading(true);
      const c = await authService.getUserById(userId);
      if (!didCancel) {
        setUser(c);
        setLoading(false);
      }
    }

    getUserAsync();

    return function cleanUp() {
      didCancel = true;
    };
  }, [userId]);

  if (type === 'displayNameWithLabel') {
    return (
      <Descriptions column={1} size="small">
        <Descriptions.Item label={title}>
          {loading ? (
            <Spin size="small" />
          ) : (
            <Text>{user?.displayName ?? '<Chưa có>'}</Text>
          )}
        </Descriptions.Item>
      </Descriptions>
    );
  }

  return (
    <Popover
      title={title}
      placement={placement || 'left'}
      content={<span>{user?.displayName}</span>}
    >
      {loading ? (
        <Spin size="small" />
      ) : type === 'avatar' ? (
        <Avatar
          icon={<UserOutlined />}
          size="small"
          src={user?.avatarUrl}
          {...restProps}
        />
      ) : (
        <Text>{user?.displayName}</Text>
      )}
    </Popover>
  );
};

UserAvatar.defaultProps = {
  type: 'avatar',
};
export default memo(UserAvatar);
