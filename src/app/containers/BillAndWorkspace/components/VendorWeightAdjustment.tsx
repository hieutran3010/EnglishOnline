import React, { memo, useCallback, useState } from 'react';
import {
  Modal,
  Typography,
  Divider,
  Descriptions,
  InputNumber,
  Form,
  Tooltip,
  Spin,
  Space,
  Button,
} from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import isUndefined from 'lodash/fp/isUndefined';

import Bill from 'app/models/bill';
import { toCurrency } from 'utils/numberFormat';
import {
  PurchasePriceCountingParams,
  PurchasePriceCountingResult,
} from 'app/models/purchasePriceCounting';
import BillFetcher from 'app/fetchers/billFetcher';

const getPurchasePrice = (
  params: PurchasePriceCountingParams,
): Promise<PurchasePriceCountingResult> => {
  const billFetcher = new BillFetcher();

  return billFetcher.countPurchasePrice(params);
};

const { Title, Text } = Typography;

interface Props {
  bill: Bill;
  onSaveNewWeight?: (
    oldWeight: number,
    newWeight: number,
    predictPurchasePrice: PurchasePriceCountingResult,
  ) => void;
  onRestoreSaleWeight?: (
    saleWeight: number,
    purchasePrice: PurchasePriceCountingResult,
  ) => void;
}
const VendorWeightAdjustment = ({
  bill,
  onSaveNewWeight,
  onRestoreSaleWeight,
}: Props) => {
  const [form] = Form.useForm();

  const [predictPurchasePrice, setPredictPurchasePrice] = useState<
    PurchasePriceCountingResult
  >(new PurchasePriceCountingResult());
  const [isCountingPurchasePrice, setIsCountingPurchasePrice] = useState(false);

  const [visible, setVisible] = useState(false);

  const onVisible = useCallback(() => {
    setVisible(true);
  }, []);

  const onClose = useCallback(() => {
    setPredictPurchasePrice(new PurchasePriceCountingResult());
    form.resetFields();
    setVisible(false);
  }, [form]);

  const onSubmitVendorWeight = useCallback(
    async form => {
      const { vendorWeightInKg } = form;
      if (isUndefined(vendorWeightInKg)) {
        return;
      }

      setIsCountingPurchasePrice(true);

      const countingParams = new PurchasePriceCountingParams();
      countingParams.destinationCountry = bill.destinationCountry;
      countingParams.fuelChargePercent = bill.vendorFuelChargePercent;
      countingParams.otherFeeInUsd = bill.vendorOtherFee;
      countingParams.usdExchangeRate = bill.usdExchangeRate;
      countingParams.vat = bill.vat;
      countingParams.vendorId = bill.vendorId;
      countingParams.weightInKg = vendorWeightInKg;

      const purchasePriceCountingResult = await getPurchasePrice(
        countingParams,
      );

      setPredictPurchasePrice(purchasePriceCountingResult);

      setIsCountingPurchasePrice(false);
    },
    [bill],
  );

  const onSubmitNewWeight = useCallback(() => {
    if (onSaveNewWeight) {
      onSaveNewWeight(
        bill.weightInKg,
        form.getFieldValue('vendorWeightInKg'),
        predictPurchasePrice,
      );
    }
    onClose();
  }, [bill.weightInKg, form, onClose, onSaveNewWeight, predictPurchasePrice]);

  const onCancelVendorWeight = useCallback(async () => {
    setIsCountingPurchasePrice(true);

    const countingParams = new PurchasePriceCountingParams();
    countingParams.destinationCountry = bill.destinationCountry;
    countingParams.fuelChargePercent = bill.vendorFuelChargePercent;
    countingParams.otherFeeInUsd = bill.vendorOtherFee;
    countingParams.usdExchangeRate = bill.usdExchangeRate;
    countingParams.vat = bill.vat;
    countingParams.vendorId = bill.vendorId;
    countingParams.weightInKg = bill.oldWeightInKg || 0;

    const purchasePriceCountingResult = await getPurchasePrice(countingParams);

    if (onRestoreSaleWeight) {
      onRestoreSaleWeight(bill.oldWeightInKg || 0, purchasePriceCountingResult);
    }

    setIsCountingPurchasePrice(false);
  }, [
    bill.destinationCountry,
    bill.oldWeightInKg,
    bill.usdExchangeRate,
    bill.vat,
    bill.vendorFuelChargePercent,
    bill.vendorId,
    bill.vendorOtherFee,
    onRestoreSaleWeight,
  ]);

  return (
    <>
      {isUndefined(bill.oldWeightInKg) ? (
        <>
          <Button type="primary" onClick={onVisible}>
            Nhập ký NCC
          </Button>

          <Modal
            onCancel={onClose}
            width={650}
            visible={visible}
            title={bill.airlineBillId || '<Chưa có Bill hãng bay>'}
            okText="Lưu số ký mới"
            onOk={onSubmitNewWeight}
          >
            <div style={{ display: 'flex' }}>
              <div style={{ flex: 0.5 }}>
                <Title level={4}>Trọng lượng mới</Title>
                <Descriptions size="small" column={1}>
                  <Descriptions.Item
                    label={
                      <Space>
                        <span>Số kg</span>
                        <Tooltip title="Nhập ký mới sau đó nhấn Enter để xem Giá mua mới">
                          <InfoCircleOutlined style={{ marginBottom: 5 }} />
                        </Tooltip>
                      </Space>
                    }
                  >
                    <Form
                      form={form}
                      size="small"
                      noValidate
                      onFinish={onSubmitVendorWeight}
                    >
                      <Form.Item noStyle name="vendorWeightInKg">
                        <InputNumber
                          ref={(ref: any) => ref?.select()}
                          min={0}
                          disabled={isCountingPurchasePrice}
                        />
                      </Form.Item>
                    </Form>
                  </Descriptions.Item>
                  <Descriptions.Item label="Giá mua vào (USD)">
                    {isCountingPurchasePrice ? (
                      <Spin size="small" />
                    ) : (
                      <Text mark>
                        {toCurrency(
                          predictPurchasePrice.purchasePriceAfterVatInUsd || 0,
                          true,
                        )}
                      </Text>
                    )}
                  </Descriptions.Item>
                </Descriptions>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Divider type="vertical" />
              </div>
              <div style={{ flex: 0.5 }}>
                <Title level={4}>Trọng lượng bán cho Khách</Title>
                <Descriptions size="small" column={1}>
                  <Descriptions.Item label="Số kg">
                    <Text>{bill.weightInKg}kg</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Giá mua vào (USD)">
                    <Text>
                      {toCurrency(bill.purchasePriceInUsd ?? 0, true)}
                    </Text>
                  </Descriptions.Item>
                </Descriptions>
              </div>
            </div>
          </Modal>
        </>
      ) : (
        <Button
          type="primary"
          onClick={onCancelVendorWeight}
          loading={isCountingPurchasePrice}
        >
          Hủy ký NCC
        </Button>
      )}
    </>
  );
};

export default memo(VendorWeightAdjustment);
