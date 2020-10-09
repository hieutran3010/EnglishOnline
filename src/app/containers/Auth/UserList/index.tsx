/**
 *
 * UserList
 *
 */

import React, { memo, useCallback, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Button, Table, Checkbox } from 'antd';
import toString from 'lodash/fp/toString';

import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';
import { ContentContainer } from 'app/components/Layout';

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
        sorter: (a, b) => a.email.length - b.email.length,
      },
      {
        title: 'Tên',
        dataIndex: 'displayName',
        key: 'displayName',
        ...getLocalColumnSearchProps('countries'),
        sorter: (a, b) => a.displayName.length - b.displayName.length,
      },
      {
        title: 'Số ĐT',
        dataIndex: 'phoneNumber',
        key: 'phoneNumber',
        ...getLocalColumnSearchProps('phoneNumber'),
        sorter: (a, b) =>
          toString(a.phoneNumber).length - toString(b.phoneNumber).length,
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
        sorter: (a, b) => a.roles[0].length - b.roles[0].length,
      },
      {
        title: 'Đã Xác Thực?',
        dataIndex: 'emailVerified',
        key: 'emailVerified',
        render: data => {
          return <Checkbox checked={data} disabled />;
        },
        sorter: (a, b) =>
          toString(a.emailVerified).length - toString(b.emailVerified).length,
      },
      {
        title: 'Đã khóa?',
        dataIndex: 'disabled',
        key: 'disabled',
        render: data => {
          return <Checkbox checked={data} disabled />;
        },
        sorter: (a, b) =>
          toString(a.disabled).length - toString(b.disabled).length,
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
    <ContentContainer
      title="Danh sách Người Dùng"
      extra={[
        <Button key="1" type="primary" onClick={onCreateNewUser}>
          Thêm mới
        </Button>,
      ]}
    >
      <Table
        size="small"
        dataSource={users}
        columns={userColumns}
        loading={isFetchingUsers}
        pagination={false}
        rowKey={(record: any) => record.id}
      />
    </ContentContainer>
  );
});
