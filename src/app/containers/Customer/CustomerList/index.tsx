/**
 *
 * CustomerList
 *
 */

import React, { useMemo, useCallback, useEffect } from 'react';
import { Button, Space, Divider } from 'antd';
import { useHistory } from 'react-router-dom';

import { RootContainer } from 'app/components/Layout';
import type Customer from 'app/models/customer';
import getDataSource, { FETCHER_KEY } from 'app/collection-datasource';
import {
  DataGrid,
  ColumnDefinition,
  COLUMN_TYPES,
} from 'app/components/collection/DataGrid';
import { authStorage } from 'app/services/auth';
import { Role } from 'app/models/user';
import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';
import { reducer, sliceKey, actions } from './slice';
import { customerListSaga } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { showConfirm } from 'app/components/Modal/utils';
import { selectNeedToReload } from './selectors';

export function CustomerList() {
  useInjectReducer({ key: sliceKey, reducer });
  useInjectSaga({ key: sliceKey, saga: customerListSaga });

  const history = useHistory();
  const dispatch = useDispatch();

  const user = authStorage.getUser();

  const customerDataSource = useMemo(() => {
    const dataSource = getDataSource(FETCHER_KEY.CUSTOMER);
    dataSource.orderByFields = 'name';
    return dataSource;
  }, []);

  const needToReload = useSelector(selectNeedToReload);

  useEffect(() => {
    if (needToReload) {
      customerDataSource.onReloadData();
      dispatch(actions.setNeedToReload(false));
    }
  }, [customerDataSource, dispatch, needToReload]);

  const onCreateNewCustomer = useCallback(() => {
    history.push('/customerCreation');
  }, [history]);

  const onUpdateCustomer = useCallback(
    (customer: Customer) => () => {
      history.push(`/customerUpdating/${customer.id}`);
    },
    [history],
  );

  const onDeleteCustomer = useCallback(
    (customer: Customer) => () => {
      showConfirm(
        `Bạn có chắc muốn xóa khách hàng ${customer.name}? Không thể khôi phục sau khi xóa, tiếp tục?`,
        () => {
          dispatch(actions.deleteCustomer(customer.id));
        },
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const columns = useMemo((): ColumnDefinition[] => {
    let result: ColumnDefinition[] = [
      {
        title: 'Tên KH',
        dataIndex: 'name',
        key: 'name',
        width: 80,
        canFilter: true,
        type: COLUMN_TYPES.STRING,
        fixed: true,
      },
      {
        title: 'Số ĐT',
        dataIndex: 'phone',
        key: 'phone',
        type: COLUMN_TYPES.STRING,
        width: 50,
        canFilter: true,
        fixed: true,
      },
      {
        title: 'Địa Chỉ',
        dataIndex: 'address',
        key: 'address',
        type: COLUMN_TYPES.STRING,
        width: 200,
        canFilter: true,
      },
      {
        title: 'Gợi nhớ',
        dataIndex: 'hint',
        key: 'hint',
        type: COLUMN_TYPES.STRING,
        width: 150,
      },
      {
        title: 'Tác Vụ',
        key: 'action',
        render: record => (
          <Space size={1}>
            <Button size="small" type="link" onClick={onUpdateCustomer(record)}>
              Cập nhật
            </Button>
            <Divider type="vertical" />
            <Button
              size="small"
              type="link"
              danger
              onClick={onDeleteCustomer(record)}
            >
              Xóa
            </Button>
          </Space>
        ),
        width: 50,
      },
    ];

    if (user.role === Role.ACCOUNTANT) {
      result.pop();
    }

    return result;
  }, [onDeleteCustomer, onUpdateCustomer, user.role]);

  const rightActions =
    user.role === Role.ACCOUNTANT
      ? []
      : [
          <Button key="1" type="primary" onClick={onCreateNewCustomer}>
            Thêm mới
          </Button>,
        ];

  return (
    <>
      <RootContainer
        title="Danh sách Khách hàng"
        rightComponents={rightActions}
      >
        <DataGrid
          dataSource={customerDataSource}
          columns={columns}
          pageSize={20}
          heightOffset={0.3}
        />
      </RootContainer>
    </>
  );
}
