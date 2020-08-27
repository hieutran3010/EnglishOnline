import React, { memo, useMemo, useCallback, useState, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import isEmpty from 'lodash/fp/isEmpty';
import filter from 'lodash/fp/filter';
import {
  Space,
  Button,
  Divider,
  Modal,
  Typography,
  Menu,
  Dropdown,
  Empty,
} from 'antd';
import { DownOutlined, CheckOutlined } from '@ant-design/icons';
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

import BillView from './BillView';
import VendorWeightAdjustment from './VendorWeightAdjustment';
import UserAvatar from 'app/containers/Auth/components/UserAvatar';
import BillStatusTag from './BillStatusTag';

const { Text } = Typography;

const canEdit = (user: User, bill: Bill) => {
  if (
    user.role === Role.SALE ||
    bill.isArchived === true ||
    bill.status === BILL_STATUS.DONE
  ) {
    return false;
  }

  if (user.role === Role.LICENSE && bill.status === BILL_STATUS.LICENSE) {
    return bill.licenseUserId === user.id;
  }

  if (user.role === Role.ACCOUNTANT && bill.status === BILL_STATUS.ACCOUNTANT) {
    return bill.accountantUserId === user.id;
  }

  if (user.role === Role.ADMIN) {
    return true;
  }

  return false;
};

interface Props {
  onArchiveBill?: (billId: string) => void;
  billDataSource: IDataSource;
  isReset?: boolean;
  excludeFields?: string[];
  extendCols?: ColumnDefinition[];
  onPrintedVatBill?: (bill: Bill) => void;
  dontLoadInitialData?: boolean;
  heightOffset?: number;
  width?: number;
  disableFilterFields?: string[];
}
const BillList = ({
  onArchiveBill,
  billDataSource,
  isReset,
  excludeFields,
  extendCols,
  onPrintedVatBill,
  dontLoadInitialData,
  heightOffset,
  width,
  disableFilterFields,
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

  const getUpdateMenuItems = useCallback(
    (bill: Bill): ReactNode[] => {
      const MenuItems: ReactNode[] = [];
      const isAbleToEditInfo = canEdit(user, bill);
      const userRole = user.role as Role;

      if (isAbleToEditInfo) {
        MenuItems.push(
          <Menu.Item key={0}>
            <Link to={`/billUpdating/${bill.id}`}>Sửa thông tin</Link>
          </Menu.Item>,
          <Menu.Item key={1}>
            <Link to={`/billUpdating/${bill.id}`} target="_blank">
              Sửa thông tin ở Tab mới
            </Link>
          </Menu.Item>,
        );
      }

      if (
        isAbleToEditInfo &&
        [Role.ACCOUNTANT, Role.ADMIN].includes(userRole)
      ) {
        MenuItems.push(
          <Menu.Item key={2}>
            <VendorWeightAdjustment
              bill={bill}
              oldWeightInKg={bill.oldWeightInKg}
              purchasePriceInUsd={bill.purchasePriceInUsd || 0}
              canSelfSubmit={true}
              onSubmitSucceeded={onSubmitWeightSucceeded}
            />
          </Menu.Item>,
        );
      }

      if (userRole !== Role.ACCOUNTANT) {
        MenuItems.push(
          <Menu.Item key={3}>
            <Link to={`/billStatusUpdating/${bill.id}`}>
              Cập nhật tình trạng hàng
            </Link>
          </Menu.Item>,
        );
      }

      return MenuItems;
    },
    [onSubmitWeightSucceeded, user],
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
        render: value => <span>{value ?? '<Không có>'}</span>,
      },
      {
        title: 'Bill con',
        dataIndex: 'childBillId',
        key: 'childBillId',
        canFilter: true,
        type: COLUMN_TYPES.STRING,
        width: 150,
        render: value => <span>{value ?? '<Không có>'}</span>,
      },
      {
        title: 'Ngày',
        dataIndex: 'date',
        key: 'date',
        type: COLUMN_TYPES.DATE,
        sorter: true,
        width: 130,
      },
      {
        title: 'Tên Khách Gởi',
        key: 'senderName',
        dataIndex: 'senderName',
        canFilter:
          !disableFilterFields || !disableFilterFields.includes('senderName'),
        type: COLUMN_TYPES.STRING,
        width: 200,
      },
      {
        title: 'Tên Người Nhận',
        key: 'receiverName',
        dataIndex: 'receiverName',
        canFilter:
          !disableFilterFields || !disableFilterFields.includes('receiverName'),
        type: COLUMN_TYPES.STRING,
        width: 200,
      },
      {
        title: 'NCC',
        dataIndex: 'vendorName',
        key: 'vendorName',
        type: COLUMN_TYPES.STRING,
        canFilter: true,
        width: 200,
      },
      {
        title: 'Loại Hàng',
        dataIndex: 'description',
        key: 'description',
        type: COLUMN_TYPES.STRING,
        canFilter: true,
        width: 200,
      },
      {
        title: 'Nước đến',
        dataIndex: 'destinationCountry',
        key: 'destinationCountry',
        type: COLUMN_TYPES.STRING,
        canFilter: true,
        width: 200,
      },
      {
        title: 'TL (kg)',
        key: 'weightInKg',
        type: COLUMN_TYPES.NUMBER,
        width: 100,
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
        title: 'Tên Chứng Từ',
        dataIndex: 'licenseUserId',
        key: 'licenseUserId',
        type: COLUMN_TYPES.STRING,
        width: 150,
        render: value => <UserAvatar userId={value} type="displayName" />,
      },
      {
        title: 'Trạng Thái',
        dataIndex: 'status',
        key: 'status',
        render: (value: any) => <BillStatusTag status={value} />,
        width: 100,
      },
      {
        title: 'Hủy?',
        dataIndex: 'isArchived',
        key: 'isArchived',
        width: 50,
        render: (value: boolean) =>
          value === true ? (
            <CheckOutlined style={{ color: 'red', marginBottom: 5 }} />
          ) : (
            <></>
          ),
      },
      {
        title: 'Tác Vụ',
        key: 'action',
        width: 150,
        fixed: 'right',
        render: (record: Bill) => {
          const updateMenuItems = getUpdateMenuItems(record);

          return (
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

              {!isEmpty(updateMenuItems) && (
                <>
                  <Divider type="vertical" />
                  <Dropdown
                    overlay={<Menu>{updateMenuItems}</Menu>}
                    trigger={['click']}
                  >
                    <Button type="link" style={{ paddingLeft: 8 }}>
                      Sửa <DownOutlined />
                    </Button>
                  </Dropdown>
                </>
              )}
            </Space>
          );
        },
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
    disableFilterFields,
    excludeFields,
    extendCols,
    getUpdateMenuItems,
    onArchiveBill,
    onViewBill,
  ]);

  return (
    <>
      {!isReset && (
        <>
          <DataGrid
            dataSource={billDataSource}
            columns={columns}
            pageSize={20}
            width={width ?? 'max-content'}
            dontLoadInitialData={dontLoadInitialData}
            heightOffset={heightOffset || 0.32}
            size="small"
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
      {isReset && <Empty description={false} />}
    </>
  );
};

export default memo(BillList);
