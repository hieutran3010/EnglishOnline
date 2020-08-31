import React, { memo, useMemo } from 'react';
import { Modal, Button, Typography, Table, Space } from 'antd';
import moment from 'moment';
import Bill, { BillQuotation, PurchasePriceInfo } from 'app/models/bill';
import { ColumnDefinition } from 'app/components/collection/DataGrid';
import { toCurrency } from 'utils/numberFormat';

const { Text } = Typography;

interface Props {
  visible: boolean;
  onOk: () => void;
  purchasePriceInfo: PurchasePriceInfo;
  bill?: any;
}
const BillQuotationModal = ({
  visible,
  onOk,
  purchasePriceInfo,
  bill,
}: Props) => {
  const billQuotationsColumn = useMemo((): ColumnDefinition[] => {
    return [
      {
        title: 'TL (kg)',
        key: 'weight',
        render: (record: BillQuotation) => {
          const selectedQuotation =
            record.priceInUsd === purchasePriceInfo.quotationPriceInUsd;

          const isOldQuotation =
            purchasePriceInfo.oldQuotationPriceInUsd &&
            purchasePriceInfo.oldQuotationPriceInUsd !==
              purchasePriceInfo.quotationPriceInUsd &&
            purchasePriceInfo.oldQuotationPriceInUsd === record.priceInUsd;

          if (record.startWeight) {
            return (
              <Text
                mark={selectedQuotation}
                type={isOldQuotation === true ? 'danger' : undefined}
              >{`${record.startWeight} - ${record.endWeight}`}</Text>
            );
          }

          return (
            <Text
              type={isOldQuotation === true ? 'danger' : undefined}
              mark={selectedQuotation}
            >
              {record.endWeight}
            </Text>
          );
        },
      },
      {
        title: 'Giá (USD)',
        key: 'price',
        render: (record: BillQuotation) => {
          const selectedQuotation =
            record.priceInUsd === purchasePriceInfo.quotationPriceInUsd;

          const isOldQuotation =
            purchasePriceInfo.oldQuotationPriceInUsd &&
            purchasePriceInfo.oldQuotationPriceInUsd !==
              purchasePriceInfo.quotationPriceInUsd &&
            purchasePriceInfo.oldQuotationPriceInUsd === record.priceInUsd;
          return (
            <Text
              mark={selectedQuotation}
              type={isOldQuotation === true ? 'danger' : undefined}
            >
              {toCurrency(record.priceInUsd || 0, true)}
            </Text>
          );
        },
      },
    ];
  }, [
    purchasePriceInfo.oldQuotationPriceInUsd,
    purchasePriceInfo.quotationPriceInUsd,
  ]);

  return (
    <Modal
      title={
        <Space>
          <Text>Báo giá đang sử dụng cho bill</Text>
          <Text strong>
            {bill.airlineBillId ||
              bill.childBillId ||
              '<chưa có bill hãng bay/bill con>'}
          </Text>
        </Space>
      }
      visible={visible}
      onOk={onOk}
      onCancel={onOk}
      width="100%"
      footer={[
        <Button key="back" type="primary" onClick={onOk}>
          OK
        </Button>,
      ]}
    >
      {purchasePriceInfo.lastUpdatedQuotation && (
        <Text>{`Báo giá được chỉnh sửa lần cuối ngày ${moment(
          purchasePriceInfo.lastUpdatedQuotation,
        ).format('DD-MM-YYYY')}`}</Text>
      )}
      <Table
        dataSource={purchasePriceInfo.billQuotations}
        columns={billQuotationsColumn}
        size="small"
      />
    </Modal>
  );
};

export default memo(BillQuotationModal);
