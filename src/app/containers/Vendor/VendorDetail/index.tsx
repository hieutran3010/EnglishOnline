/**
 *
 * VendorDetail
 *
 */

import React, {
  memo,
  useEffect,
  useCallback,
  useMemo,
  ReactElement,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';
import { Button, Descriptions, Typography } from 'antd';

import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';
import { RootContainer, ContentContainer } from 'app/components/Layout';

import { actions, reducer, sliceKey } from './slice';
import { selectVendor, selectIsFetchingVendor } from './selectors';
import { vendorDetailSaga } from './saga';
import QuotationSheet from '../VendorQuotationDetail/QuotationSheet';
import { authorizeHelper, authStorage } from 'app/services/auth';
import { Role } from 'app/models/user';
const { Text } = Typography;
interface Props {}

export const VendorDetailPage = memo((props: Props) => {
  useInjectReducer({ key: sliceKey, reducer: reducer });
  useInjectSaga({ key: sliceKey, saga: vendorDetailSaga });

  const vendor = useSelector(selectVendor);
  const isFetchingVendor = useSelector(selectIsFetchingVendor);

  const dispatch = useDispatch();
  const history = useHistory();
  const { vendorId } = useParams();

  useEffect(() => {
    dispatch(actions.fetchVendor(vendorId));
  }, [dispatch, vendorId]);

  const onNavigateToBasicInfoPage = useCallback(() => {
    history.push(`/vendorCreation/${vendorId}`);
  }, [history, vendorId]);

  const onNavigateToQuotationDetail = useCallback(() => {
    history.push(`/vendorQuotationDetail/${vendorId}`);
  }, [history, vendorId]);

  const onNavigateToQuotation = useCallback(() => {
    history.push(`/vendorQuotation/${vendorId}`);
  }, [history, vendorId]);

  const currentUserRole = authStorage.getRole();
  const updateInfoActions =
    currentUserRole !== Role.SALE
      ? [
          <Button type="primary" onClick={onNavigateToBasicInfoPage}>
            Cập nhật
          </Button>,
        ]
      : [];

  const updateFeeActions =
    currentUserRole !== Role.SALE
      ? [
          <Button type="primary" onClick={onNavigateToQuotation}>
            Cập nhật
          </Button>,
        ]
      : [];

  const updateQuotationActions = useMemo(() => {
    const actions: ReactElement[] = [];

    if (currentUserRole !== Role.SALE) {
      actions.push(
        <Button type="primary" onClick={onNavigateToQuotation}>
          Cập nhật Zone
        </Button>,
      );
    }

    if (currentUserRole === Role.ADMIN) {
      actions.push(
        <Button type="primary" onClick={onNavigateToQuotationDetail}>
          Cập nhật Giá
        </Button>,
      );
    }

    return actions;
  }, [currentUserRole, onNavigateToQuotation, onNavigateToQuotationDetail]);

  return (
    <>
      <RootContainer
        title={`Nhà Cung Cấp ${vendor.name}`}
        rightComponents={updateInfoActions}
        canBack
      >
        <ContentContainer loading={isFetchingVendor}>
          <Descriptions bordered size="small">
            <Descriptions.Item label="Tên nhà cung cấp" span={4}>
              {vendor.name}
            </Descriptions.Item>
            {authorizeHelper.willRenderIfNot(
              [Role.SALE],
              <>
                <Descriptions.Item label="Địa chỉ văn phòng" span={4}>
                  {vendor.officeAddress}
                </Descriptions.Item>
                <Descriptions.Item label="Số điện thoại liên lạc" span={4}>
                  {vendor.phone}
                </Descriptions.Item>
              </>,
            )}
            <Descriptions.Item label="Tình Trạng" span={4}>
              {vendor.isStopped && <Text type="danger">Ngừng hợp tác</Text>}
              {!vendor.isStopped && <Text type="warning">Đang hợp tác</Text>}
            </Descriptions.Item>
          </Descriptions>
        </ContentContainer>
      </RootContainer>

      <RootContainer title="Các loại Phí" rightComponents={updateFeeActions}>
        <ContentContainer loading={isFetchingVendor}>
          <Descriptions bordered size="small">
            <Descriptions.Item label="Phí nhiên liệu (%)" span={3}>
              {vendor.fuelChargePercent || 0}%
            </Descriptions.Item>
            <Descriptions.Item label="Phí khác (USD)" span={3}>
              {vendor.otherFeeInUsd || 0}$
            </Descriptions.Item>
          </Descriptions>
        </ContentContainer>
      </RootContainer>

      {authorizeHelper.canRenderWithRole(
        [Role.SALE, Role.ACCOUNTANT],
        <RootContainer title="Báo Giá" rightComponents={updateQuotationActions}>
          <ContentContainer loading={isFetchingVendor}>
            <QuotationSheet vendor={vendor} isReadOnly />
          </ContentContainer>
        </RootContainer>,
      )}
    </>
  );
});
