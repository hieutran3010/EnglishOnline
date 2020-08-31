import * as Sentry from '@sentry/react';
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
import { toast } from 'react-toastify';
import { InfoCircleOutlined } from '@ant-design/icons';
import isUndefined from 'lodash/fp/isUndefined';
import isNil from 'lodash/fp/isNil';
import moment from 'moment';

import Bill, { PurchasePriceInfo, BillQuotation } from 'app/models/bill';
import { toCurrency } from 'utils/numberFormat';
import {
  PurchasePriceCountingParams,
  PurchasePriceCountingResult,
} from 'app/models/purchasePriceCounting';
import BillFetcher from 'app/fetchers/billFetcher';
import { showConfirm } from 'app/components/Modal/utils';
import isEmpty from 'lodash/fp/isEmpty';

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
  oldWeightInKg?: number;
  purchasePriceInUsd: number;
  canSelfSubmit?: boolean;
  onSubmitSucceeded?: () => void;
  billQuotations: BillQuotation[];
}
const VendorWeightAdjustment = ({
  bill,
  purchasePriceInUsd,
  onSaveNewWeight,
  onRestoreSaleWeight,
  oldWeightInKg,
  canSelfSubmit,
  onSubmitSucceeded,
  billQuotations,
}: Props) => {
  const [form] = Form.useForm();

  const [predictPurchasePrice, setPredictPurchasePrice] = useState<
    PurchasePriceCountingResult | undefined
  >();

  const [isCountingPurchasePrice, setIsCountingPurchasePrice] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculatePurchasePrice = useCallback(
    async (weight: number) => {
      setIsCountingPurchasePrice(true);

      const countingParams = new PurchasePriceCountingParams();
      countingParams.destinationCountry = bill.destinationCountry;
      countingParams.fuelChargePercent = bill.vendorFuelChargePercent;
      countingParams.otherFeeInUsd = bill.vendorOtherFee;
      countingParams.usdExchangeRate = bill.usdExchangeRate || 0;
      countingParams.vat = bill.vat;
      countingParams.vendorId = bill.vendorId;
      countingParams.weightInKg = weight;
      countingParams.billQuotations = billQuotations;
      countingParams.isGetLatestQuotation = isEmpty(billQuotations);

      const purchasePriceCountingResult = await getPurchasePrice(
        countingParams,
      );

      setIsCountingPurchasePrice(false);

      return purchasePriceCountingResult;
    },
    [
      bill.destinationCountry,
      bill.usdExchangeRate,
      bill.vat,
      bill.vendorFuelChargePercent,
      bill.vendorId,
      bill.vendorOtherFee,
      billQuotations,
    ],
  );

  const onVisible = useCallback(() => {
    setVisible(true);
  }, []);

  const onClose = useCallback(() => {
    setPredictPurchasePrice(undefined);
    form.resetFields();
    setVisible(false);
  }, [form]);

  const onSubmitVendorWeight = useCallback(
    async form => {
      const { vendorWeightInKg } = form;
      if (isUndefined(vendorWeightInKg)) {
        return;
      }

      if (vendorWeightInKg === bill.weightInKg) {
        toast.info('Ký mới không được giống ký cũ');
        return;
      }

      const purchasePriceCountingResult = await calculatePurchasePrice(
        vendorWeightInKg,
      );

      setPredictPurchasePrice(purchasePriceCountingResult);
    },
    [bill.weightInKg, calculatePurchasePrice],
  );

  const onSubmitNewWeight = useCallback(async () => {
    const _newWeight = form.getFieldValue('vendorWeightInKg');

    if (!_newWeight) {
      onClose();
      return;
    }

    if (_newWeight === bill.weightInKg) {
      toast.info('Ký mới không được giống ký cũ');
      return;
    }

    let price: PurchasePriceCountingResult;
    if (!predictPurchasePrice) {
      price = await calculatePurchasePrice(_newWeight);
    } else {
      price = predictPurchasePrice as PurchasePriceCountingResult;
    }

    if (canSelfSubmit) {
      setIsSubmitting(true);

      try {
        const submitBill = new Bill(bill);
        submitBill.oldWeightInKg = submitBill.weightInKg;
        submitBill.weightInKg = _newWeight;
        submitBill.date = moment(submitBill.date)
          .hour(23)
          .minute(0)
          .format('YYYY-MM-DD HH:mm');
        const purchasePriceInfo = submitBill.getPurchasePriceInfo();
        purchasePriceInfo.updateFromCountingResult(price);
        submitBill.updatePurchasePriceInfo(purchasePriceInfo);

        const billFetcher = new BillFetcher();
        await billFetcher.updateAsync(submitBill.id, submitBill);

        toast.success('Đã lưu ký mới');
        if (onSubmitSucceeded) onSubmitSucceeded();
        onClose();
      } catch (error) {
        Sentry.captureException(error);
        toast.error('Chưa lưu được ký mới');
      }

      setIsSubmitting(false);
    } else {
      if (onSaveNewWeight) {
        onSaveNewWeight(bill.weightInKg, _newWeight, price);
      }

      onClose();
    }
  }, [
    bill,
    calculatePurchasePrice,
    canSelfSubmit,
    form,
    onClose,
    onSaveNewWeight,
    onSubmitSucceeded,
    predictPurchasePrice,
  ]);

  const onCancelVendorWeight = useCallback(async () => {
    let price: PurchasePriceCountingResult;
    if (!predictPurchasePrice) {
      price = await calculatePurchasePrice(oldWeightInKg || 0);
    } else {
      price = predictPurchasePrice as PurchasePriceCountingResult;
    }

    if (canSelfSubmit) {
      showConfirm(
        `Bạn có chắc muốn hủy ký của NCC là ${
          bill.weightInKg
        }kg và trả lại ký bán khách hàng ban đầu là ${
          oldWeightInKg || 0
        }kg cho bill ${bill.airlineBillId || '<Chưa có bill hãng bay>'}?`,
        async () => {
          setIsSubmitting(true);

          try {
            const submitBill = new Bill(bill);
            submitBill.oldWeightInKg = undefined;
            submitBill.weightInKg = oldWeightInKg || 0;
            submitBill.date = moment(submitBill.date)
              .hour(23)
              .minute(0)
              .format('YYYY-MM-DD HH:mm');
            const purchasePriceInfo = submitBill.getPurchasePriceInfo();
            purchasePriceInfo.updateFromCountingResult(price);
            submitBill.updatePurchasePriceInfo(purchasePriceInfo);

            const billFetcher = new BillFetcher();
            await billFetcher.updateAsync(submitBill.id, submitBill);

            toast.success('Đã trả lại ký bán khách hàng ban đầu');
            if (onSubmitSucceeded) onSubmitSucceeded();
            onClose();
          } catch (error) {
            Sentry.captureException(error);
            toast.error('Chưa trả lại được ký bán khách hàng ban đầu');
          }

          setIsSubmitting(false);
        },
      );
    } else {
      if (onRestoreSaleWeight) {
        onRestoreSaleWeight(oldWeightInKg || 0, price);
      }
    }
  }, [
    bill,
    calculatePurchasePrice,
    canSelfSubmit,
    oldWeightInKg,
    onClose,
    onRestoreSaleWeight,
    onSubmitSucceeded,
    predictPurchasePrice,
  ]);

  return (
    <>
      {isUndefined(oldWeightInKg) || isNil(oldWeightInKg) ? (
        <>
          <Button
            type={canSelfSubmit ? 'text' : 'primary'}
            style={{ paddingLeft: canSelfSubmit ? 0 : 15 }}
            onClick={onVisible}
          >
            Nhập ký NCC
          </Button>

          <Modal
            onCancel={onClose}
            width={650}
            visible={visible}
            title={bill.airlineBillId || '<Chưa có Bill hãng bay>'}
            okText="Lưu số ký mới"
            onOk={onSubmitNewWeight}
            confirmLoading={isSubmitting}
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
                          predictPurchasePrice?.purchasePriceAfterVatInUsd || 0,
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
                    <Text>{toCurrency(purchasePriceInUsd ?? 0, true)}</Text>
                  </Descriptions.Item>
                </Descriptions>
              </div>
            </div>
          </Modal>
        </>
      ) : (
        <Button
          type={canSelfSubmit ? 'text' : 'primary'}
          onClick={onCancelVendorWeight}
          loading={isCountingPurchasePrice}
          style={{ paddingLeft: canSelfSubmit ? 0 : 15 }}
        >
          Hủy ký NCC
        </Button>
      )}
    </>
  );
};

export default memo(VendorWeightAdjustment);
