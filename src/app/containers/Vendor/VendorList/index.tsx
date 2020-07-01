/**
 *
 * VendorList
 *
 */

import React, { memo, useCallback, useMemo } from 'react';
import { Button, Space, Divider, Dropdown, Menu } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { useHistory, Link } from 'react-router-dom';

import { RootContainer } from 'app/components/Layout';
import {
  DataGrid,
  ColumnDefinition,
  COLUMN_TYPES,
} from 'app/components/collection/DataGrid';
import getDataSource, { FETCHER_KEY } from 'app/collection-datasource';
import Vendor from 'app/models/vendor';
import { authStorage, authorizeHelper } from 'app/services/auth';
import { Role } from 'app/models/user';

const getMenu = (vendor: Vendor) => (
  <Menu>
    <Menu.Item key="0">
      <Link to={`/vendorCreation/${vendor.id}`}>Cập nhật Thông tin</Link>
    </Menu.Item>
    <Menu.Item key="1">
      <Link to={`/vendorQuotation/${vendor.id}`}>Cập nhật Phí & Zone</Link>
    </Menu.Item>
    <Menu.Item key="3">
      <Link to={`/vendorQuotationDetail/${vendor.id}`}>Cập nhật Báo giá</Link>
    </Menu.Item>
  </Menu>
);

const vendorDataSource = getDataSource(FETCHER_KEY.VENDOR);
vendorDataSource.orderByFields = 'name';

interface Props {}
export const VendorList = memo((props: Props) => {
  const history = useHistory();
  const currentUserRole = authStorage.getRole();

  const onCreateNewVendor = useCallback(() => {
    history.push('/vendorCreation');
  }, [history]);

  const onViewDetailVendor = useCallback(
    record => () => {
      history.push(`/vendorDetail/${record.id}`);
    },
    [history],
  );

  const columns = useMemo((): ColumnDefinition[] => {
    return [
      {
        title: 'Tên nhà cung cấp',
        dataIndex: 'name',
        key: 'name',
        width: 80,
        canFilter: true,
        type: COLUMN_TYPES.STRING,
      },
      {
        title: 'Số ĐT',
        dataIndex: 'phone',
        key: 'phone',
        width: 60,
        type: COLUMN_TYPES.STRING,
      },
      {
        title: 'Phí khác (USD)',
        dataIndex: 'otherFeeInUsd',
        key: 'otherFeeInUsd',
        type: COLUMN_TYPES.CURRENCY,
        width: 50,
      },
      {
        title: 'Phí nhiên liệu (%)',
        dataIndex: 'fuelChargePercent',
        key: 'fuelChargePercent',
        type: COLUMN_TYPES.PERCENT,
        width: 50,
      },
      {
        title: 'Tác Vụ',
        key: 'action',
        render: record => (
          <Space size={1}>
            {authorizeHelper.canRenderWithRole(
              [Role.ADMIN, Role.LICENSE],
              <>
                <Dropdown overlay={getMenu(record)} trigger={['click']}>
                  <Button type="link">
                    <Space>
                      Cập nhật <DownOutlined />
                    </Space>
                  </Button>
                </Dropdown>
                <Divider type="vertical" />
              </>,
            )}
            <Button
              size="small"
              type="link"
              onClick={onViewDetailVendor(record)}
            >
              Chi tiết
            </Button>
          </Space>
        ),
        width: 50,
      },
    ];
  }, [onViewDetailVendor]);

  const actions = [Role.ADMIN, Role.LICENSE].includes(currentUserRole)
    ? [
        <Button key="1" type="primary" onClick={onCreateNewVendor}>
          Thêm mới
        </Button>,
      ]
    : [];

  return (
    <>
      <RootContainer title="Danh sách nhà cung cấp" rightComponents={actions}>
        <DataGrid
          dataSource={vendorDataSource}
          columns={columns}
          pageSize={20}
          locale={{ emptyText: 'Không tìm thấy nhà cung cấp nào :(' }}
        />
      </RootContainer>
    </>
  );
});
