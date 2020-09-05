/**
 *
 * ServiceList
 *
 */

import React, { memo, useMemo, useCallback, useEffect, useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { Button, Space, Table } from 'antd';

import {
  COLUMN_TYPES,
  ColumnDefinition,
} from 'app/components/collection/DataGrid';
import { RootContainer } from 'app/components/Layout';
import ParcelService from 'app/models/parcelService';
import { showConfirm } from 'app/components/Modal/utils';
import { sliceKey, actions, reducer } from './slice';
import { serviceListSaga } from './saga';
import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsWorkingOnServiceList, selectServices } from './selectors';
import ServiceView from './ServiceView';

export const ServiceList = memo(() => {
  useInjectReducer({ key: sliceKey, reducer });
  useInjectSaga({ key: sliceKey, saga: serviceListSaga });

  const history = useHistory();
  const dispatch = useDispatch();

  const isWorkingOnServiceList = useSelector(selectIsWorkingOnServiceList);
  const services = useSelector(selectServices);

  const [visibleServiceView, setVisibleServiceView] = useState(false);
  const [selectedService, setSelectedService] = useState<ParcelService>();

  useEffect(() => {
    dispatch(actions.fetchServices());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCreateNew = useCallback(() => {
    history.push('/serviceCreation');
  }, [history]);

  const onDelete = useCallback(
    (service: ParcelService) => () => {
      showConfirm(
        'Tất cả Zone của dich vụ và các NCC đang sử dụng dịch vụ cũng bị xóa theo và không thể phục hổi. Bạn có chắc muốn tiếp tục xóa?',
        () => {
          dispatch(actions.deleteService(service.id));
        },
      );
    },
    [dispatch],
  );

  const onView = useCallback(
    (service: ParcelService) => () => {
      setSelectedService(service);
      setVisibleServiceView(true);
    },
    [],
  );

  const onClose = useCallback(() => {
    setVisibleServiceView(false);
  }, []);

  const columns = useMemo((): ColumnDefinition[] => {
    return [
      {
        title: 'Tên dịch vụ',
        dataIndex: 'name',
        key: 'name',
        canFilter: true,
        type: COLUMN_TYPES.STRING,
        sorter: (a, b) => a.name.length - b.name.length,
      },
      {
        title: 'Tác Vụ',
        key: 'actions',
        render: (record: ParcelService) => {
          return (
            <Space>
              <Button size="small" type="link" onClick={onView(record)}>
                Xem
              </Button>
              <Link to={`/serviceUpdating/${record.id}`}>Sửa</Link>
              {!record.isSystem && (
                <Button
                  size="small"
                  type="text"
                  danger
                  onClick={onDelete(record)}
                >
                  Xóa
                </Button>
              )}
            </Space>
          );
        },
      },
    ];
  }, [onDelete, onView]);

  return (
    <>
      <RootContainer
        title="Danh sách dịch vụ"
        rightComponents={[
          <Button key="1" type="primary" onClick={onCreateNew}>
            Thêm mới
          </Button>,
        ]}
      >
        <Table
          loading={isWorkingOnServiceList}
          dataSource={services}
          columns={columns}
          pagination={false}
          rowKey={r => r.id}
        />
        <ServiceView
          visible={visibleServiceView}
          service={selectedService}
          onClose={onClose}
        />
      </RootContainer>
    </>
  );
});
