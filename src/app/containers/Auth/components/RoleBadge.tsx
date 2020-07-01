import React, { memo } from 'react';
import { Tag } from 'antd';
import { Role } from 'app/models/user';
interface Props {
  role: Role | string;
  type: 'Text' | 'Tag';
}
const RoleBadge = ({ role, type }: Props) => {
  switch (role) {
    case Role.ADMIN: {
      if (type === 'Text') {
        return <span>Admin</span>;
      }
      return (
        <Tag color={'red'} key={role}>
          ADMIN
        </Tag>
      );
    }
    case Role.LICENSE: {
      if (type === 'Text') {
        return <span>Chứng Từ</span>;
      }
      return (
        <Tag color={'geekblue'} key={role}>
          CHỨNG TỪ
        </Tag>
      );
    }
    case Role.ACCOUNTANT: {
      if (type === 'Text') {
        return <span>Kế Toán</span>;
      }

      return (
        <Tag color={'purple'} key={role}>
          KẾ TOÁN
        </Tag>
      );
    }
    case Role.SALE: {
      if (type === 'Text') {
        return <span>Sale</span>;
      }
      return (
        <Tag color={'gold'} key={role}>
          SALE
        </Tag>
      );
    }
    default: {
      return <></>;
    }
  }
};

RoleBadge.defaultProps = {
  type: 'tag',
};

export default memo(RoleBadge);
