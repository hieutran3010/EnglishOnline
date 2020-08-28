/**
 *
 * BillUpdating
 *
 */

import React, { memo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';
import { reducer, sliceKey, actions } from './slice';
import {
  selectIsFetchingBill,
  selectBill,
  selectIsShowBillReview,
} from './selectors';
import { billUpdatingSaga } from './saga';
import { RootContainer, ContentContainer } from 'app/components/Layout';
import { BillCreateOrUpdate } from '../BillCreateOrUpdate';
import { useParams } from 'react-router-dom';
import { SagaInjectionModes } from 'redux-injectors';
import BillView from '../components/BillView';
import { BILL_STATUS } from 'app/models/bill';

interface Props {}

export const BillUpdating = memo((props: Props) => {
  useInjectReducer({ key: sliceKey, reducer: reducer });
  useInjectSaga({
    key: sliceKey,
    saga: billUpdatingSaga,
    mode: SagaInjectionModes.RESTART_ON_REMOUNT,
  });

  const { billId } = useParams();
  const dispatch = useDispatch();

  const isFetchingBill = useSelector(selectIsFetchingBill);
  const bill = useSelector(selectBill);
  const isShowBillReview = useSelector(selectIsShowBillReview);

  useEffect(() => {
    dispatch(actions.fetchBill(billId));
  }, [billId, dispatch]);

  useEffect(() => {
    return function cleanUp() {
      dispatch(actions.resetState());
    };
  }, [dispatch]);

  const subTitle =
    isShowBillReview || bill.status === BILL_STATUS.DONE
      ? 'Thông tin'
      : 'Cập nhật';

  return (
    <RootContainer
      title={`${subTitle} bill ${
        bill.airlineBillId ||
        bill.childBillId ||
        '<chưa có bill hãng bay/bill con>'
      }`}
      canBack
    >
      <ContentContainer loading={isFetchingBill}>
        {isShowBillReview || bill.status === BILL_STATUS.DONE ? (
          <BillView bill={bill} />
        ) : (
          <BillCreateOrUpdate inputBill={bill} canDelete={false} />
        )}
      </ContentContainer>
    </RootContainer>
  );
});
