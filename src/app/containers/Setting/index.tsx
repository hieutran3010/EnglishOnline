/**
 *
 * Setting
 *
 */

import React, { memo, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';
import { reducer, sliceKey, actions } from './slice';
import {
  selectIsFetchingBillParams,
  selectBillParams,
  selectIsUpdatingBillParams,
} from './selectors';
import { settingSaga } from './saga';
import { RootContainer, ContentContainer } from 'app/components/Layout';
import { Form, InputNumber, Button } from 'antd';
import { CurrencyInput } from 'app/components/Input';

export const Setting = memo(() => {
  useInjectReducer({ key: sliceKey, reducer: reducer });
  useInjectSaga({ key: sliceKey, saga: settingSaga });

  const [billParamsForm] = Form.useForm();

  const isFetchingBillParams = useSelector(selectIsFetchingBillParams);
  const billParams = useSelector(selectBillParams);
  const isUpdatingBillParams = useSelector(selectIsUpdatingBillParams);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(actions.fetchAppParams());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    billParamsForm.setFieldsValue(billParams);
  }, [billParams, billParamsForm]);

  const billParamsValidator = useMemo(() => {
    return {
      vat: [{ required: true, message: 'Chưa nhập VAT' }],
      usdExchangeRate: [{ required: true, message: 'Chưa nhập tỷ giá' }],
    };
  }, []);

  const onSubmitBillParams = useCallback(form => {
    dispatch(actions.updateBillParams(form));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <RootContainer title="Thông số Bill">
        <ContentContainer loading={isFetchingBillParams}>
          <Form
            form={billParamsForm}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 10 }}
            onFinish={onSubmitBillParams}
          >
            <Form.Item
              label="VAT(%)"
              name="vat"
              rules={billParamsValidator.vat}
            >
              <InputNumber
                ref={(ref: any) => ref?.select()}
                disabled={isUpdatingBillParams}
              />
            </Form.Item>
            <Form.Item
              label="Tỷ giá USD(VNĐ)"
              name="usdExchangeRate"
              rules={billParamsValidator.usdExchangeRate}
            >
              <CurrencyInput disabled={isUpdatingBillParams} />
            </Form.Item>
            <Form.Item label=" " colon={false}>
              <Button
                htmlType="submit"
                type="primary"
                loading={isUpdatingBillParams}
              >
                LƯU
              </Button>
            </Form.Item>
          </Form>
        </ContentContainer>
      </RootContainer>
    </>
  );
});
