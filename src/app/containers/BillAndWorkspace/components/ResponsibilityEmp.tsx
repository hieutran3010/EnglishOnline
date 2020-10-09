import React, { memo, useMemo } from 'react';
import { Typography, Form, Select, Space, Row, Col } from 'antd';
import filter from 'lodash/fp/filter';
import map from 'lodash/fp/map';

import { authorizeHelper, authStorage } from 'app/services/auth';
import User, { Role } from 'app/models/user';

import { BillValidator } from 'app/models/validators/billValidator';

const { Title, Text } = Typography;

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
  const user = authStorage.getUser();
  const adminUsers = useMemo(() => {
    return filter((u: User) => u.roles.includes(Role.ADMIN))(users);
  }, [users]);

  const saleUserOptions = useMemo(() => {
    const saleUsers = filter((u: User) => u.roles.includes(Role.SALE))(users);
    return map((u: User) => renderUserOption(u))(saleUsers.concat(adminUsers));
  }, [adminUsers, users]);

  const licenseUserOptions = useMemo(() => {
    if (user.role === Role.LICENSE) {
      return [];
    }
    const licenseUsers = filter((u: User) => u.roles.includes(Role.LICENSE))(
      users,
    );
    return map((u: User) => renderUserOption(u))(
      licenseUsers.concat(adminUsers),
    );
  }, [adminUsers, user.role, users]);

  const accountantUserOptions = useMemo(() => {
    if (user.role === Role.ACCOUNTANT) {
      return [];
    }

    const accountantUsers = filter((u: User) =>
      u.roles.includes(Role.ACCOUNTANT),
    )(users);
    return map((u: User) => renderUserOption(u))(
      accountantUsers.concat(adminUsers),
    );
  }, [adminUsers, user.role, users]);

  return (
    <>
      <Title level={4} type="secondary">
        Nhân viên xử lý
      </Title>
      <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
        <Col
          xs={{ span: 12 }}
          sm={{ span: 12 }}
          md={{ span: 12 }}
          lg={{ span: 8 }}
        >
          <Form.Item
            name="saleUserId"
            label="Sale"
            labelAlign="right"
            wrapperCol={{ span: 15 }}
            rules={billValidator.saleUserId}
          >
            <Select loading={isFetchingUsers}>{saleUserOptions}</Select>
          </Form.Item>
        </Col>
        <Col
          xs={{ span: 12 }}
          sm={{ span: 12 }}
          md={{ span: 12 }}
          lg={{ span: 8 }}
        >
          {user.role !== Role.LICENSE ? (
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
          ) : (
            <div style={{ display: 'flex' }}>
              <Form.Item
                hidden
                name="licenseUserId"
                style={{ position: 'absolute' }}
              >
                <Text />
              </Form.Item>
              <Space>
                <Text>Chứng từ: </Text>
                <Text strong>{user.displayName}</Text>
              </Space>
            </div>
          )}
        </Col>
        {authorizeHelper.canRenderWithRole(
          [Role.ACCOUNTANT],
          <Col
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 8 }}
          >
            {user.role !== Role.ACCOUNTANT ? (
              <Form.Item
                name="accountantUserId"
                label="Kế toán"
                labelAlign="right"
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 15 }}
                rules={billValidator.accountantUserId}
              >
                <Select loading={isFetchingUsers}>
                  {accountantUserOptions}
                </Select>
              </Form.Item>
            ) : (
              <div style={{ display: 'flex' }}>
                <Form.Item
                  hidden
                  name="accountantUserId"
                  style={{ position: 'absolute' }}
                >
                  <Text />
                </Form.Item>
                <Space>
                  <Text>Kế toán: </Text>
                  <Text strong>{user.displayName}</Text>
                </Space>
              </div>
            )}
          </Col>,
        )}
      </Row>
    </>
  );
};

export default memo(ResponsibilityEmp);
