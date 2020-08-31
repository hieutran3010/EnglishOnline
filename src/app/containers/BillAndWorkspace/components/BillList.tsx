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
  Tabs,
  Spin,
} from 'antd';
import { DownOutlined, CheckOutlined } from '@ant-design/icons';
import {
  COLUMN_TYPES,
  ColumnDefinition,
  DataGrid,
} from 'app/components/collection/DataGrid';
import Bill, { BILL_STATUS, BillDeliveryHistory } from 'app/models/bill';
import { showConfirm } from 'app/components/Modal/utils';
import { IDataSource } from 'app/components/collection/types';
import { authorizeHelper, authStorage } from 'app/services/auth';
import User, { Role } from 'app/models/user';

import BillView from './BillView';
import VendorWeightAdjustment from './VendorWeightAdjustment';
import UserAvatar from 'app/containers/Auth/components/UserAvatar';
import BillStatusTag from './BillStatusTag';
import DeliveryTimeline from '../BillDeliveryHistory/DeliveryTimeline';
import BillFetcher from 'app/fetchers/billFetcher';

const { TabPane } = Tabs;
const { Text } = Typography;

const billFetcher = new BillFetcher();

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
  onRestoreArchivedBill?: (billId: string) => void;
  onReturnFinalBillToAccountant?: (billId: string) => void;
  onForceDeleteBill?: (billId: string) => void;
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
  onRestoreArchivedBill,
  onReturnFinalBillToAccountant,
  onForceDeleteBill,
}: Props) => {
  const user = authStorage.getUser();

  const [selectedBill, setSelectedBill] = useState(new Bill());
  const [visibleBillView, setVisibleBillView] = useState(false);
  const [
    isFetchingDeliveryHistories,
    setIsFetchingDeliveryHistories,
  ] = useState(false);
  const [histories, setHistories] = useState<BillDeliveryHistory[]>([]);
  const [activatedTab, setActivatedTab] = useState('1');
  const [loadedHistories, setLoadedHistories] = useState(false);

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
      setHistories([]);
      setActivatedTab('1');
      setLoadedHistories(false);
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

  const onTabChanged = useCallback(
    async activeKey => {
      setActivatedTab(activeKey);
      if (activeKey === '2' && !loadedHistories) {
        if (isEmpty(histories)) {
          setIsFetchingDeliveryHistories(true);

          const bill = await billFetcher.queryOneAsync(
            { query: `Id = "${selectedBill.id}"` },
            ['billDeliveryHistories { date time status }'],
          );

          const { billDeliveryHistories } = bill as any;
          setHistories(billDeliveryHistories);

          setLoadedHistories(true);
          setIsFetchingDeliveryHistories(false);
        }
      }
    },
    [histories, loadedHistories, selectedBill.id],
  );

  const _onRestoreArchivedBill = useCallback(
    (billId: string) => {
      if (onRestoreArchivedBill) {
        onRestoreArchivedBill(billId);
        onCancelViewBill();
      }
    },
    [onCancelViewBill, onRestoreArchivedBill],
  );

  const _onReturnFinalBillToAccountant = useCallback(
    (billId: string) => {
      if (onReturnFinalBillToAccountant) {
        onReturnFinalBillToAccountant(billId);
        onCancelViewBill();
      }
    },
    [onCancelViewBill, onReturnFinalBillToAccountant],
  );

  const _onForceDeleteBill = useCallback(
    (billId: string) => {
      if (onForceDeleteBill) {
        onForceDeleteBill(billId);
        onCancelViewBill();
      }
    },
    [onCancelViewBill, onForceDeleteBill],
  );

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
              billQuotations={bill.billQuotations}
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
        sorter: true,
        width: 200,
      },
      {
        title: 'TL (kg)',
        key: 'weightInKg',
        type: COLUMN_TYPES.NUMBER,
        width: 100,
        sorter: true,
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

              {!isEmpty(updateMenuItems) && (
                <>
                  <Divider type="vertical" style={{ margin: 0 }} />
                  <Dropdown
                    overlay={<Menu>{updateMenuItems}</Menu>}
                    trigger={['click']}
                  >
                    <Button type="link">
                      Sửa <DownOutlined />
                    </Button>
                  </Dropdown>
                </>
              )}

              {onArchiveBill &&
                record.status === BILL_STATUS.DONE &&
                !record.isArchived &&
                authorizeHelper.canRenderWithRole(
                  [Role.ADMIN, Role.ACCOUNTANT],
                  <>
                    <Divider type="vertical" style={{ margin: 0 }} />
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
            rowSelection={{}}
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
            <Tabs onChange={onTabChanged} type="card" activeKey={activatedTab}>
              <TabPane tab="Thông tin bill" key={1}>
                <BillView
                  bill={selectedBill}
                  onArchiveBill={
                    onArchiveBill ? onArchiveBillFromViewMode : undefined
                  }
                  onPrintedVat={onPrintedVatBill}
                  onRestoreArchivedBill={_onRestoreArchivedBill}
                  onReturnFinalBillToAccountant={_onReturnFinalBillToAccountant}
                  onForceDeleteBill={_onForceDeleteBill}
                />
              </TabPane>
              <TabPane tab="Tình trạng hàng" key={2}>
                {isFetchingDeliveryHistories ? (
                  <Spin />
                ) : (
                  <DeliveryTimeline histories={histories} isReadOnly />
                )}
              </TabPane>
            </Tabs>
          </Modal>
        </>
      )}
      {isReset && <Empty description={false} />}
    </>
  );
};

export default memo(BillList);
