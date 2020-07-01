import React, { memo } from 'react';
import { Select } from 'antd';
import { SelectProps } from 'antd/lib/select';
import { Role } from 'app/models/user';
const { Option } = Select;

const RoleSelection = React.forwardRef((props: SelectProps<any>, ref: any) => {
  return (
    <Select ref={ref} {...props}>
      <Option key={1} value={Role.LICENSE}>
        Chứng Từ
      </Option>
      <Option key={2} value={Role.ACCOUNTANT}>
        Kế Toán
      </Option>
      <Option key={3} value={Role.SALE}>
        Sale
      </Option>
      <Option key={4} value={Role.ADMIN}>
        Admin
      </Option>
    </Select>
  );
});

export default memo(RoleSelection);
