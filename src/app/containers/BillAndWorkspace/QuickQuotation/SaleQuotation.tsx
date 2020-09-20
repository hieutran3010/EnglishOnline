import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Descriptions,
  Form,
  InputNumber,
  List,
  Popover,
  Space,
  Table,
  Typography,
} from 'antd';
import isEmpty from 'lodash/fp/isEmpty';

import { ColumnDefinition } from 'app/components/collection/DataGrid';
import { CurrencyInput } from 'app/components/Input';
import { ContentContainer } from 'app/components/Layout';
import { CountrySelect } from 'app/components/Select';
import { Role } from 'app/models/user';
import { QuotationReport, QuotationReportDetail } from 'app/models/vendor';
import { authorizeHelper, authStorage } from 'app/services/auth';
import { toCurrency } from 'utils/numberFormat';

import {
  selectBillParams,
  selectIsFetchingQuotation,
  selectQuotationReports,
} from './selectors';
import { actions } from './slice';

const { Text } = Typography;

const SaleQuotation = () => {
  const dispatch = useDispatch();

  const [quotationForm] = Form.useForm();
  const role = authStorage.getRole();

  const isFetchingQuotation = useSelector(selectIsFetchingQuotation);
  const quotationReports = useSelector(selectQuotationReports);
  const billParams = useSelector(selectBillParams);

  const [hasVat, setHasVat] = useState(false);
  const [salePrice, setSalePrice] = useState<number | undefined>();

  useEffect(() => {
    dispatch(actions.fetchBillParams());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const { vat, usdExchangeRate } = billParams || {};
    quotationForm.setFieldsValue({
      vat: hasVat ? vat : undefined,
      usdExchangeRate,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billParams]);

  const onGetQuotation = useCallback(
    formData => {
      const { destinationCountry, weightInKg, vat, usdExchangeRate } = formData;
      dispatch(
        actions.fetchQuotationReports({
          destinationCountry,
          weightInKg,
          vat,
          usdExchangeRate,
          isApplySaleRate: role === Role.SALE,
        }),
      );
    },
    [dispatch, role],
  );

  const onVatHavingChanged = useCallback(
    e => {
      const checked = e.target.checked;
      setHasVat(checked);
      if (checked === true) {
        const { vat } = billParams || {};
        quotationForm.setFieldsValue({ vat });
      } else {
        quotationForm.setFieldsValue({ vat: undefined });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [billParams],
  );

  const onCountProfit = useCallback(profitFormData => {
    const { salePrice } = profitFormData;
    setSalePrice(salePrice);
  }, []);

  const quotationColumns = useMemo((): ColumnDefinition[] => {
    let result = [
      {
        title: 'Dịch Vụ',
        key: 'service',
        render: (record: QuotationReportDetail) => {
          const { zone, service } = record;
          return (
            <Space size="small">
              <Text>{service ? service : 'Dịch vụ theo NCC'}</Text>
              <Text>{`(${zone})`}</Text>
            </Space>
          );
        },
      },
      {
        title: 'Giá Mua',
        key: 'price',
        render: (record: QuotationReportDetail) => {
          const {
            purchasePriceAfterVatInUsd,
            purchasePriceAfterVatInVnd,
          } = record;
          return (
            <Popover
              content={
                <Descriptions size="small" bordered column={2}>
                  <Descriptions.Item label="Báo Giá">
                    <Space>
                      <Text>
                        {toCurrency(record.quotationPriceInUsd || 0, true)}
                      </Text>
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="Giá Net">
                    {toCurrency(record.vendorNetPriceInUsd || 0, true)}
                  </Descriptions.Item>
                </Descriptions>
              }
            >
              <Space size="small">
                <Text strong>
                  {toCurrency(purchasePriceAfterVatInUsd, true)}
                </Text>
                <Text>=</Text>
                <Text strong>{toCurrency(purchasePriceAfterVatInVnd)}</Text>
              </Space>
            </Popover>
          );
        },
      },
    ];

    if (salePrice) {
      result.push({
        title: 'Lợi Nhuận',
        key: 'profit',
        render: (record: QuotationReportDetail) => {
          const { purchasePriceAfterVatInVnd } = record;
          const profit = salePrice - purchasePriceAfterVatInVnd;
          return (
            <Space size="small">
              <Text strong style={{ color: profit > 0 ? 'green' : 'red' }}>
                {toCurrency(profit)}
              </Text>
            </Space>
          );
        },
      });
    }

    return result;
  }, [salePrice]);

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <ContentContainer title="" size="small">
        <Form
          form={quotationForm}
          labelAlign="right"
          labelCol={{ span: 7 }}
          wrapperCol={{ span: 10 }}
          onFinish={onGetQuotation}
          size="small"
        >
          <Form.Item
            name="destinationCountry"
            label="Nước đến"
            rules={[{ required: true, message: 'Chưa chọn Quốc gia đến' }]}
          >
            <CountrySelect
              ref={(ref: any) => ref?.focus()}
              mode={undefined}
              showSearch
            />
          </Form.Item>
          <Form.Item
            label="Trọng lượng (kg)"
            name="weightInKg"
            rules={[{ required: true, message: 'Chưa nhập trọng lượng hàng' }]}
          >
            <InputNumber precision={2} min={0} />
          </Form.Item>
          <Form.Item
            name="usdExchangeRate"
            label="Tỉ giá USD"
            rules={[{ required: true, message: 'Chưa nhập tỉ giá USD' }]}
          >
            <CurrencyInput />
          </Form.Item>
          <Form.Item
            name="vat"
            label={
              <Space>
                <Checkbox checked={hasVat} onChange={onVatHavingChanged}>
                  VAT (%)
                </Checkbox>
              </Space>
            }
          >
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item label=" " colon={false}>
            <Button htmlType="submit" type="primary">
              Xem báo giá
            </Button>
          </Form.Item>
        </Form>
      </ContentContainer>
      {!isEmpty(quotationReports) && (
        <>
          <Alert
            type="info"
            showIcon
            message={
              <Space direction="vertical" size="small">
                <Text>
                  Dịch vụ có giá rẻ nhất nằm ở đầu danh sách khi hiện 1 cột, từ
                  trái qua phải khi hiện từ 2 cột
                </Text>
                <Text>{`Không bao gồm các dịch vụ chưa có báo giá cho nước ${quotationForm.getFieldValue(
                  'destinationCountry',
                )}`}</Text>
              </Space>
            }
          />
          {authorizeHelper.canRenderWithRole(
            [Role.ADMIN],
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Form onFinish={onCountProfit} layout="inline">
                <Form.Item
                  name="salePrice"
                  rules={[{ required: true, message: 'Chưa nhập giá bán' }]}
                >
                  <CurrencyInput
                    ref={(ref: any) => ref?.focus()}
                    placeholder="Nhập giá bán (VNĐ)"
                  />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Tính Lợi Nhuận
                  </Button>
                </Form.Item>
              </Form>
            </div>,
          )}
        </>
      )}
      <List
        size="small"
        grid={{
          gutter: 5,
          xs: 1,
          sm: 2,
          md: 2,
          lg: 2,
          xl: 2,
          xxl: 3,
        }}
        style={{ marginLeft: -15, marginRight: -15 }}
        loading={isFetchingQuotation}
        dataSource={quotationReports}
        renderItem={(item: QuotationReport) => (
          <List.Item>
            <Card size="small" title={item.vendorName}>
              <Space
                size="small"
                direction="vertical"
                style={{ width: '100%' }}
              >
                <Descriptions size="small" column={2} bordered>
                  <Descriptions.Item label="Phí nhiên liệu">
                    {item.fuelChargePercent || 0}%
                  </Descriptions.Item>
                  <Descriptions.Item label="Phí khác">
                    {toCurrency(item.otherFeeInUsd || 0, true)}
                  </Descriptions.Item>
                </Descriptions>
                <Table
                  size="small"
                  dataSource={item.quotation}
                  pagination={false}
                  columns={quotationColumns}
                  rowKey={r => r.zone}
                />
              </Space>
            </Card>
          </List.Item>
        )}
      />
    </Space>
  );
};

export default memo(SaleQuotation);
