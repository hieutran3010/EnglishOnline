/**
 *
 * VendorQuotationDetail
 *
 */

import React, { memo, useCallback, useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { Button, Space, Alert, Card } from 'antd';
import isEmpty from 'lodash/fp/isEmpty';

import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';
import { RootContainer } from 'app/components/Layout';

import { reducer, sliceKey, actions } from './slice';
import {
  selectVendor,
  selectIsSubmittingData,
  selectIsFetchingVendor,
  selectSubmitHasErrorIndicator,
} from './selectors';
import { vendorQuotationDetailSaga } from './saga';
import QuotationSheet from './QuotationSheet';

export const VendorQuotationDetail = memo(() => {
  useInjectReducer({ key: sliceKey, reducer: reducer });
  useInjectSaga({ key: sliceKey, saga: vendorQuotationDetailSaga });

  const vendor = useSelector(selectVendor);
  const isSubmittingData = useSelector(selectIsSubmittingData);
  const isFetchingVendor = useSelector(selectIsFetchingVendor);
  const submitHasErrorIndicator = useSelector(selectSubmitHasErrorIndicator);

  const [hasChanged, setHasChanged] = useState(false);

  const dispatch = useDispatch();
  const { vendorId } = useParams<any>();
  const history = useHistory();
  const sheetRef = useRef();

  useEffect(() => {
    dispatch(actions.fetchVendor(vendorId));
  }, [dispatch, vendorId]);

  const { zones } = vendor;
  const canUpdate = zones && !isEmpty(zones);

  const onNavigateToZoneManagement = useCallback(() => {
    history.push(`/vendorQuotation/${vendorId}`);
  }, [history, vendorId]);

  const onSaveData = useCallback(() => {
    if (sheetRef.current) {
      const ref = sheetRef.current as any;
      dispatch(actions.submitData(ref.props.data));
    }

    setHasChanged(false);
  }, [dispatch]);

  const onCellChange = useCallback(() => {
    setHasChanged(true);
  }, []);

  return (
    <RootContainer
      title={`Báo Giá của ${vendor.name}`}
      subTitle="Cập nhật thông tin Báo giá"
      canBack
    >
      <Card size="small" loading={isFetchingVendor} bordered={false}>
        {!canUpdate && (
          <Space>
            <Alert
              type="warning"
              showIcon
              message="Vui lòng nhập Zone trước khi cập nhật Báo giá"
            />
            <Button onClick={onNavigateToZoneManagement} type="primary">
              Quản Lý Zone
            </Button>
          </Space>
        )}
        {canUpdate && (
          <>
            <Space style={{ marginBottom: 20 }}>
              <Button
                type="primary"
                onClick={onSaveData}
                loading={isSubmittingData}
              >
                Lưu cập nhật
              </Button>
              {hasChanged && !submitHasErrorIndicator && (
                <Alert
                  type="warning"
                  showIcon
                  message="Có dữ liệu cần lưu, nhớ bấm Lưu để tránh mất dữ liệu"
                />
              )}
              {submitHasErrorIndicator && (
                <Alert
                  type="error"
                  showIcon
                  message="Chưa lưu được, vui lòng thủ lại!"
                />
              )}
            </Space>
            <Alert
              message="Đơn vị giá là USD"
              type="success"
              showIcon
              style={{ marginBottom: 5 }}
            />

            <QuotationSheet
              ref={sheetRef}
              vendor={vendor}
              onCellChanged={onCellChange}
            />
            {hasChanged && (
              <Alert
                style={{ marginTop: 5 }}
                banner
                message="Có dữ liệu cần lưu, nhớ bấm Lưu để tránh mất dữ liệu"
              />
            )}
          </>
        )}
      </Card>
    </RootContainer>
  );
});
