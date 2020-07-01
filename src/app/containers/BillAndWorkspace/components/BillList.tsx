import React, { memo, useMemo, useCallback, useState } from 'react';
import isEmpty from 'lodash/fp/isEmpty';
import filter from 'lodash/fp/filter';
import {
  Space,
  Button,
  Divider,
  Checkbox,
  Modal,
  Table as AntDataGrid,
} from 'antd';

import {
  COLUMN_TYPES,
  ColumnDefinition,
  DataGrid,
} from 'app/components/collection/DataGrid';
import Bill, { BILL_STATUS } from 'app/models/bill';
import { showConfirm } from 'app/components/Modal/utils';
import { IDataSource } from 'app/components/collection/types';
import { authorizeHelper } from 'app/services/auth';
import { Role } from 'app/models/user';

import BillStatusTag from './BillStatusTag';
import BillView from './BillView';

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

  const columns = useMemo((): ColumnDefinition[] => {
    const moreCols = extendCols ? extendCols : [];
    const result: ColumnDefinition[] = [
      {
        title: 'Đã Hủy?',
        dataIndex: 'isArchived',
        key: 'isArchived',
        render: (value: boolean) => <Checkbox disabled checked={value} />,
        width: 100,
      },
      {
        title: 'Trạng Thái',
        dataIndex: 'status',
        key: 'status',
        render: (value: any) => <BillStatusTag status={value} />,
        width: 150,
      },
      {
        title: 'Bill hãng bay',
        dataIndex: 'airlineBillId',
        key: 'airlineBillId',
        canFilter: true,
        type: COLUMN_TYPES.STRING,
      },
      {
        title: 'Bill con',
        dataIndex: 'childBillId',
        key: 'childBillId',
        canFilter: true,
        type: COLUMN_TYPES.STRING,
      },
      {
        title: 'Ngày',
        dataIndex: 'date',
        key: 'date',
        type: COLUMN_TYPES.DATE_TIME,
      },
      {
        title: 'Nhà cung cấp',
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
        dataIndex: 'weightInKg',
        key: 'weightInKg',
        type: COLUMN_TYPES.NUMBER,
      },
      ...moreCols,
      {
        title: 'Tác Vụ',
        key: 'action',
        render: (record: Bill) => (
          <Space size={1}>
            <Button size="small" type="link" onClick={onViewBill(record)}>
              Xem
            </Button>
            <Divider type="vertical" />
            {onArchiveBill &&
              record.status === BILL_STATUS.DONE &&
              !record.isArchived &&
              authorizeHelper.canRenderWithRole(
                [Role.ADMIN, Role.ACCOUNTANT],
                <Button
                  size="small"
                  type="link"
                  danger
                  onClick={_onArchiveBill(record)}
                >
                  Hủy
                </Button>,
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
  }, [_onArchiveBill, excludeFields, extendCols, onArchiveBill, onViewBill]);

  return (
    <>
      {!isReset && (
        <>
          <DataGrid
            dataSource={billDataSource}
            columns={columns}
            pageSize={20}
            locale={{ emptyText: 'Không tìm thấy Bill nào :(' }}
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
