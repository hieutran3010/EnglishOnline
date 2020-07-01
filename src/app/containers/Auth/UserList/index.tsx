/**
 *
 * UserList
 *
 */

import React, { memo, useCallback, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Button, Table, Checkbox } from 'antd';

import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';
import { RootContainer } from 'app/components/Layout';

import { actions, reducer, sliceKey } from './slice';
import { selectIsFetchingUsers, selectUsers } from './selectors';
import { userListSaga } from './saga';
import { ColumnDefinition } from 'app/components/collection/DataGrid';
import { getLocalColumnSearchProps } from 'app/components/collection/DataGrid/SearchControls';
import RoleBadge from '../components/RoleBadge';
import User from 'app/models/user';

export const UserList = memo(() => {
  useInjectReducer({ key: sliceKey, reducer: reducer });
  useInjectSaga({ key: sliceKey, saga: userListSaga });

  const isFetchingUsers = useSelector(selectIsFetchingUsers);
  const users = useSelector(selectUsers);

  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    dispatch(actions.fetchUsers());
  }, [dispatch]);

  const onCreateNewUser = useCallback(() => {
    history.push('/userCreation');
  }, [history]);

  const onUpdateUser = useCallback(
    (user: User) => () => {
      history.push(`/userUpdating/${user.id}`);
    },
    [history],
  );

  const userColumns = useMemo((): ColumnDefinition[] => {
    return [
      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
        ...getLocalColumnSearchProps('email'),
      },
      {
        title: 'Tên',
        dataIndex: 'displayName',
        key: 'displayName',
        ...getLocalColumnSearchProps('countries'),
      },
      {
        title: 'Số ĐT',
        dataIndex: 'phoneNumber',
        key: 'phoneNumber',
        ...getLocalColumnSearchProps('phoneNumber'),
      },
      {
        title: 'Quyền',
        dataIndex: 'roles',
        key: 'roles',
        render: data => {
          if (data) {
            return <RoleBadge role={data[0]} />;
          }
          return <></>;
        },
        ...getLocalColumnSearchProps('roles'),
      },
      {
        title: 'Đã Xác Thực?',
        dataIndex: 'emailVerified',
        key: 'emailVerified',
        render: data => {
          return <Checkbox checked={data} disabled />;
        },
      },
      {
        title: 'Đã khóa?',
        dataIndex: 'disabled',
        key: 'disabled',
        render: data => {
          return <Checkbox checked={data} disabled />;
        },
      },
      {
        title: '',
        key: 'action',
        render: (record: User) => (
          <Button type="link" onClick={onUpdateUser(record)}>
            Cập Nhật
          </Button>
        ),
      },
    ];
  }, [onUpdateUser]);

  return (
    <RootContainer
      title="Danh sách Người Dùng"
      rightComponents={[
        <Button key="1" type="primary" onClick={onCreateNewUser}>
          Thêm mới
        </Button>,
      ]}
    >
      <Table
        size="small"
        dataSource={users}
        columns={userColumns}
        locale={{ emptyText: 'Nhà cung cấp này chưa được nhập Zone nào :(' }}
        loading={isFetchingUsers}
        pagination={false}
        rowKey={(record: any) => record.id}
      />
    </RootContainer>
  );
});
