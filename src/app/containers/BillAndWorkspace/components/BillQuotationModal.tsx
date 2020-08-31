import React, { memo, useMemo, useCallback, useState } from 'react';
import { Modal, Button, Typography, Table, Space } from 'antd';
import moment from 'moment';
import { BillQuotation, PurchasePriceInfo } from 'app/models/bill';
import { ColumnDefinition } from 'app/components/collection/DataGrid';
import { toCurrency } from 'utils/numberFormat';

const { Text } = Typography;

interface Props {
  purchasePriceInfo: PurchasePriceInfo;
  bill?: any;
  size?: 'large' | 'middle' | 'small';
}
const BillQuotationModal = ({ purchasePriceInfo, bill, size }: Props) => {
  const [visibleQuotationModal, setVisibleQuotationModal] = useState(false);

  const onCloseQuotationModal = useCallback(() => {
    setVisibleQuotationModal(false);
  }, []);

  const onShowQuotationModal = useCallback(() => {
    setVisibleQuotationModal(true);
  }, []);

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
    <>
      <Button
        type="primary"
        ghost
        size={size ?? 'small'}
        onClick={onShowQuotationModal}
      >
        Xem báo giá đang sử dụng cho bill này
      </Button>
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
        visible={visibleQuotationModal}
        onOk={onCloseQuotationModal}
        onCancel={onCloseQuotationModal}
        width="100%"
        footer={[
          <Button key="back" type="primary" onClick={onCloseQuotationModal}>
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
    </>
  );
};

export default memo(BillQuotationModal);
