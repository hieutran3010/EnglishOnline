import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Form,
  InputNumber,
  Space,
  Table,
  Typography,
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { isEmpty, isNil, isUndefined } from 'lodash';
import some from 'lodash/fp/some';

import { ColumnDefinition } from 'app/components/collection/DataGrid';

import {
  selectIsFetchingSaleRates,
  selectSaleRates,
  selectIsSubmittingSaleRate,
  selectIsDeletingSaleRate,
} from './selectors';
import { actions } from './slice';
import getSaleQuotationRateValidator from 'app/models/validators/saleQuotationRateValidator';
import SaleQuotationRate from 'app/models/saleQuotationRate';

const { Text } = Typography;

const SaleRateSetting = () => {
  const [rateForm] = Form.useForm();
  const dispatch = useDispatch();

  const saleRates = useSelector(selectSaleRates);
  const isFetchingSaleRates = useSelector(selectIsFetchingSaleRates);
  const isSubmitting = useSelector(selectIsSubmittingSaleRate);
  const isDeletingSaleRate = useSelector(selectIsDeletingSaleRate);

  const [editingSaleRate, setEditingSaleRate] = useState<
    SaleQuotationRate | undefined
  >();

  useEffect(() => {
    dispatch(actions.fetchSaleQuotationRates());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onReset = useCallback(() => {
    if (editingSaleRate) {
      setEditingSaleRate(undefined);
    }
    rateForm.resetFields();
  }, [editingSaleRate, rateForm]);

  const onSubmitSaleRate = useCallback(
    formData => {
      dispatch(
        actions.submitSaleRate({
          saleRate: formData,
          callback: onReset,
        }),
      );
    },
    [dispatch, onReset],
  );

  const onDelete = useCallback(
    (saleRate: SaleQuotationRate) => () => {
      dispatch(actions.deleteSaleRate({ saleRate, callback: onReset }));
    },
    [dispatch, onReset],
  );

  const onEdit = useCallback(
    (saleRate: SaleQuotationRate) => () => {
      setEditingSaleRate(saleRate);
      rateForm.setFieldsValue(saleRate);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const hasEndRange = useMemo(() => {
    return some(
      (sr: SaleQuotationRate) => isNil(sr.toWeight) || isUndefined(sr.toWeight),
    )(saleRates);
  }, [saleRates]);

  const validator = getSaleQuotationRateValidator(
    saleRates,
    hasEndRange,
    editingSaleRate,
  );

  const sateRateColumns = useMemo((): ColumnDefinition[] => {
    return [
      {
        title: 'Từ số Kg',
        key: 'fromWeight',
        dataIndex: 'fromWeight',
      },
      {
        title: 'Đến số Kg',
        key: 'toWeight',
        render: (record: SaleQuotationRate) => {
          const { toWeight, fromWeight } = record;
          return (
            <Text>
              {isNil(toWeight) || isUndefined(toWeight)
                ? `>${fromWeight}`
                : toWeight}
            </Text>
          );
        },
      },
      {
        title: '% tăng',
        key: 'percent',
        dataIndex: 'percent',
      },
      {
        title: 'Tác Vụ',
        key: 'actions',
        render: (record: SaleQuotationRate) => {
          return (
            <Space size="small">
              <Button size="small" type="link" onClick={onEdit(record)}>
                Sửa
              </Button>
              <Button
                size="small"
                type="link"
                danger
                onClick={onDelete(record)}
              >
                Xóa
              </Button>
            </Space>
          );
        },
      },
    ];
  }, [onDelete, onEdit]);

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {!isEmpty(saleRates) && (
        <Alert
          type="info"
          showIcon
          message="Khi xóa 1 định mức, định mức từ đó trở lên sẽ bị xóa theo."
        />
      )}
      {hasEndRange && (
        <Alert
          banner
          showIcon
          message={`Bạn đã cài đặt định mức cuối, để thêm định mức mới, vui lòng bấm Sửa và nhập "Đến số Kg" cho định mức cuối.`}
        />
      )}
      {editingSaleRate && (
        <Alert
          type="info"
          showIcon
          message={`Bạn đang ở chế độ chỉnh sửa, để thêm thay vì sửa, vui lòng bấm "Thêm mới"`}
        />
      )}
      {(!hasEndRange || editingSaleRate) && (
        <Form form={rateForm} layout="inline" onFinish={onSubmitSaleRate}>
          <Form.Item hidden={true} name="id">
            <Text />
          </Form.Item>
          <Form.Item
            label="Từ số Kg"
            name="fromWeight"
            rules={validator.fromWeight}
          >
            <InputNumber
              precision={2}
              min={0}
              ref={(ref: any) => ref?.focus()}
              disabled={isSubmitting}
            />
          </Form.Item>
          <Form.Item
            label="Đến số Kg"
            name="toWeight"
            rules={validator.toWeight}
          >
            <InputNumber precision={2} min={0} disabled={isSubmitting} />
          </Form.Item>
          <Form.Item label="% tăng" name="percent" rules={validator.percent}>
            <InputNumber precision={2} min={0} disabled={isSubmitting} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                Lưu
              </Button>
              {!hasEndRange && (
                <Button
                  type="primary"
                  ghost
                  disabled={isSubmitting}
                  onClick={onReset}
                >
                  Thêm mới
                </Button>
              )}
            </Space>
          </Form.Item>
        </Form>
      )}
      <Table
        loading={isFetchingSaleRates || isDeletingSaleRate}
        size="small"
        pagination={false}
        columns={sateRateColumns}
        rowKey={r => r.id}
        dataSource={saleRates}
      />
    </Space>
  );
};

export default memo(SaleRateSetting);
