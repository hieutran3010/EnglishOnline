import React, { memo, useMemo } from 'react';
import { Typography, Form, Select } from 'antd';
import filter from 'lodash/fp/filter';
import map from 'lodash/fp/map';

import { authorizeHelper } from 'app/services/auth';
import User, { Role } from 'app/models/user';

import {
  StyledEmpContainer,
  StyledEmpItemContainer,
  StyledEmpCenterItemContainer,
} from '../Workspace/styles/StyledIndex';
import { BillValidator } from 'app/models/validators/billValidator';

const { Title } = Typography;

const { Option } = Select;

const renderUserOption = (u: User) => (
  <Option key={u.id} value={u.id}>
    {u.displayName}
  </Option>
);

interface Props {
  isFetchingUsers: boolean;
  users: User[];
  billValidator: BillValidator;
}
const ResponsibilityEmp = ({
  users,
  isFetchingUsers,
  billValidator,
}: Props) => {
  const adminUsers = useMemo(() => {
    return filter((u: User) => u.roles.includes(Role.ADMIN))(users);
  }, [users]);

  const saleUserOptions = useMemo(() => {
    const saleUsers = filter((u: User) => u.roles.includes(Role.SALE))(users);
    return map((u: User) => renderUserOption(u))(saleUsers.concat(adminUsers));
  }, [adminUsers, users]);

  const licenseUserOptions = useMemo(() => {
    const licenseUsers = filter((u: User) => u.roles.includes(Role.LICENSE))(
      users,
    );
    return map((u: User) => renderUserOption(u))(
      licenseUsers.concat(adminUsers),
    );
  }, [adminUsers, users]);

  const accountantUserOptions = useMemo(() => {
    const accountantUsers = filter((u: User) =>
      u.roles.includes(Role.ACCOUNTANT),
    )(users);
    return map((u: User) => renderUserOption(u))(
      accountantUsers.concat(adminUsers),
    );
  }, [adminUsers, users]);

  return (
    <>
      <Title level={4} type="secondary">
        Nhân viên xử lý
      </Title>
      <StyledEmpContainer>
        <StyledEmpItemContainer>
          <Form.Item
            name="saleUserId"
            label="Sale"
            labelAlign="right"
            wrapperCol={{ span: 15 }}
            rules={billValidator.saleUserId}
          >
            <Select loading={isFetchingUsers}>{saleUserOptions}</Select>
          </Form.Item>
        </StyledEmpItemContainer>
        <StyledEmpCenterItemContainer>
          <Form.Item
            name="licenseUserId"
            label="Chứng từ"
            labelAlign="right"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 15 }}
            rules={billValidator.licenseUserId}
          >
            <Select loading={isFetchingUsers}>{licenseUserOptions}</Select>
          </Form.Item>
        </StyledEmpCenterItemContainer>
        {authorizeHelper.canRenderWithRole(
          [Role.ACCOUNTANT],
          <StyledEmpItemContainer>
            <Form.Item
              name="accountantUserId"
              label="Kế toán"
              labelAlign="right"
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 15 }}
              rules={billValidator.accountantUserId}
            >
              <Select loading={isFetchingUsers}>{accountantUserOptions}</Select>
            </Form.Item>
          </StyledEmpItemContainer>,
        )}
      </StyledEmpContainer>
    </>
  );
};

export default memo(ResponsibilityEmp);
