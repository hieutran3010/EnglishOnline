import React, { memo, useMemo, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import isEmpty from 'lodash/fp/isEmpty';
import filter from 'lodash/fp/filter';
import {
  Space,
  Button,
  Divider,
  Checkbox,
  Modal,
  Table as AntDataGrid,
  Typography,
  Menu,
  Dropdown,
} from 'antd';
import { DownOutlined } from '@ant-design/icons';
import {
  COLUMN_TYPES,
  ColumnDefinition,
  DataGrid,
} from 'app/components/collection/DataGrid';
import Bill, { BILL_STATUS } from 'app/models/bill';
import { showConfirm } from 'app/components/Modal/utils';
import { IDataSource } from 'app/components/collection/types';
import { authorizeHelper, authStorage } from 'app/services/auth';
import User, { Role } from 'app/models/user';

import BillStatusTag from './BillStatusTag';
import BillView from './BillView';
import VendorWeightAdjustment from './VendorWeightAdjustment';

const { Text } = Typography;

const canEdit = (user: User, bill: Bill) => {
  if (
    user.role === Role.SALE ||
    bill.isArchived === true ||
    bill.status === BILL_STATUS.DONE
  ) {
    return false;
  }

  if (user.role === Role.LICENSE) {
    return bill.licenseUserId === user.id;
  }

  if (user.role === Role.ACCOUNTANT) {
    return bill.accountantUserId === user.id;
  }

  return true; // for admin
};

interface Props {
  onArchiveBill?: (billId: string) => void;
  billDataSource: IDataSource;
  isReset?: boolean;
  excludeFields?: string[];
  extendCols?: ColumnDefinition[];
  onPrintedVatBill?: (bill: Bill) => void;
}
const BillList = ({
  onArchiveBill,
  billDataSource,
  isReset,
  excludeFields,
  extendCols,
  onPrintedVatBill,
}: Props) => {
  const user = authStorage.getUser();

  const [selectedBill, setSelectedBill] = useState(new Bill());
  const [visibleBillView, setVisibleBillView] = useState(false);

  const _onArchiveBill = useCallback(
    (bill: Bill) => () => {
      showConfirm(
        `Bạn có chắc muốn hủy Bill ${bill.airlineBillId}? Bill này sẽ không được dùng trong các loại báo cáo cũng như không được hiển thị nữa!`,
        () => {
          if (onArchiveBill) {
            onArchiveBill(bill.id);
          }
        },
      );
    },
    [onArchiveBill],
  );

  const onViewBill = useCallback(
    (bill: Bill) => () => {
      setSelectedBill(bill);
      setVisibleBillView(true);
    },
    [],
  );

  const onCancelViewBill = useCallback(() => {
    setVisibleBillView(false);
  }, []);

  const onArchiveBillFromViewMode = useCallback(
    (bill: Bill) => () => {
      if (onArchiveBill) {
        onArchiveBill(bill.id);
      }

      onCancelViewBill();
    },
    [onArchiveBill, onCancelViewBill],
  );

  const onSubmitWeightSucceeded = useCallback(() => {
    billDataSource.onReloadData();
  }, [billDataSource]);

  const getMenu = useCallback(
    (bill: Bill) => (
      <Menu>
        <Menu.Item key="0">
          <Link to={`/billUpdating/${bill.id}`}>Sửa full thông tin</Link>
        </Menu.Item>
        <Menu.Item key="1">
          <Link to={`/billUpdating/${bill.id}`} target="_blank">
            Sửa full thông tin ở Tab mới
          </Link>
        </Menu.Item>
        {authorizeHelper.canRenderWithRole(
          [Role.ACCOUNTANT, Role.ADMIN],
          <Menu.Item key="2">
            <VendorWeightAdjustment
              bill={bill}
              oldWeightInKg={bill.oldWeightInKg}
              purchasePriceInUsd={bill.purchasePriceInUsd || 0}
              canSelfSubmit={true}
              onSubmitSucceeded={onSubmitWeightSucceeded}
            />
          </Menu.Item>,
        )}
      </Menu>
    ),
    [onSubmitWeightSucceeded],
  );

  const columns = useMemo((): ColumnDefinition[] => {
    const moreCols = extendCols ? extendCols : [];
    const result: ColumnDefinition[] = [
      {
        title: 'Bill hãng bay',
        dataIndex: 'airlineBillId',
        key: 'airlineBillId',
        canFilter: true,
        type: COLUMN_TYPES.STRING,
        width: 170,
        fixed: 'left',
      },
      {
        title: 'Bill con',
        dataIndex: 'childBillId',
        key: 'childBillId',
        canFilter: true,
        type: COLUMN_TYPES.STRING,
        width: 150,
        fixed: 'left',
      },
      {
        title: 'Đã Hủy?',
        dataIndex: 'isArchived',
        key: 'isArchived',
        render: (value: boolean) => <Checkbox disabled checked={value} />,
      },
      {
        title: 'Trạng Thái',
        dataIndex: 'status',
        key: 'status',
        render: (value: any) => <BillStatusTag status={value} />,
      },

      {
        title: 'Ngày',
        dataIndex: 'date',
        key: 'date',
        type: COLUMN_TYPES.DATE_TIME,
        sorter: true,
      },
      {
        title: 'Khách Gởi',
        key: 'sender',
        render: (record: Bill) => (
          <span>{[record.senderName, record.senderPhone].join(' - ')}</span>
        ),
      },
      {
        title: 'Người Nhận',
        key: 'receiver',
        render: (record: Bill) => (
          <span>
            {[record.receiverName, record.receiverAddress].join(' - ')}
          </span>
        ),
      },
      {
        title: 'NCC',
        dataIndex: 'vendorName',
        key: 'vendorName',
        type: COLUMN_TYPES.STRING,
        canFilter: true,
      },
      {
        title: 'Nước đến',
        dataIndex: 'destinationCountry',
        key: 'destinationCountry',
        type: COLUMN_TYPES.STRING,
        canFilter: true,
      },
      {
        title: 'Trọng lượng (kg)',
        key: 'weightInKg',
        type: COLUMN_TYPES.NUMBER,
        render: record => {
          const { weightInKg, oldWeightInKg } = record;
          return (
            <Space>
              <Text>{weightInKg}</Text>
              {oldWeightInKg && <Text delete>{oldWeightInKg}</Text>}
            </Space>
          );
        },
      },
      ...moreCols,
      {
        title: 'Tác Vụ',
        key: 'action',
        width: 150,
        fixed: 'right',
        render: (record: Bill) => (
          <Space size={1}>
            <Button size="small" type="link" onClick={onViewBill(record)}>
              Xem
            </Button>

            {onArchiveBill &&
              record.status === BILL_STATUS.DONE &&
              !record.isArchived &&
              authorizeHelper.canRenderWithRole(
                [Role.ADMIN, Role.ACCOUNTANT],
                <>
                  <Divider type="vertical" />
                  <Button
                    size="small"
                    type="link"
                    danger
                    onClick={_onArchiveBill(record)}
                  >
                    Hủy
                  </Button>
                </>,
              )}

            {canEdit(user, record) && (
              <>
                <Divider type="vertical" />
                <Dropdown overlay={getMenu(record)} trigger={['click']}>
                  <Button type="link" style={{ paddingLeft: 8 }}>
                    Sửa <DownOutlined />
                  </Button>
                </Dropdown>
              </>
            )}
          </Space>
        ),
      },
    ];

    if (excludeFields && !isEmpty(excludeFields)) {
      return filter(
        (col: ColumnDefinition) => !excludeFields.includes(col.dataIndex || ''),
      )(result);
    }

    return result;
  }, [
    _onArchiveBill,
    excludeFields,
    extendCols,
    getMenu,
    onArchiveBill,
    onViewBill,
    user,
  ]);

  return (
    <>
      {!isReset && (
        <>
          <DataGrid
            dataSource={billDataSource}
            columns={columns}
            pageSize={20}
            locale={{ emptyText: 'Không tìm thấy Bill nào :(' }}
            scroll={{ x: 1300 }}
          />
          <Modal
            visible={visibleBillView}
            onCancel={onCancelViewBill}
            onOk={onCancelViewBill}
            width="100%"
            centered
            footer={[
              <Button key="back" type="primary" onClick={onCancelViewBill}>
                Ok
              </Button>,
            ]}
          >
            <div style={{ paddingTop: 20 }}>
              <BillView
                bill={selectedBill}
                onArchiveBill={
                  onArchiveBill ? onArchiveBillFromViewMode : undefined
                }
                onPrintedVat={onPrintedVatBill}
              />
            </div>
          </Modal>
        </>
      )}
      {isReset && <AntDataGrid columns={columns} />}
    </>
  );
};

export default memo(BillList);
