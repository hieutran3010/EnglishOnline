/**
 *
 * BillUpdating
 *
 */

import React, { memo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';
import { reducer, sliceKey, actions } from './slice';
import { selectIsFetchingBill } from './selectors';
import { billUpdatingSaga } from './saga';
import { RootContainer, ContentContainer } from 'app/components/Layout';
import { BillCreateOrUpdate } from '../BillCreateOrUpdate';
import { selectBill } from '../BillCreateOrUpdate/selectors';
import { useParams } from 'react-router-dom';
import { SagaInjectionModes } from 'redux-injectors';
import BillTrackingId from '../components/BillTrackingId';

export const BillUpdating = memo(() => {
  useInjectReducer({ key: sliceKey, reducer: reducer });
  useInjectSaga({
    key: sliceKey,
    saga: billUpdatingSaga,
    mode: SagaInjectionModes.RESTART_ON_REMOUNT,
  });

  const { billId } = useParams() as any;
  const dispatch = useDispatch();

  const isFetchingBill = useSelector(selectIsFetchingBill);
  const bill = useSelector(selectBill);

  useEffect(() => {
    dispatch(actions.fetchBill(billId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billId]);

  return (
    <RootContainer
      title={
        <BillTrackingId
          airlineBillId={bill.airlineBillId}
          childBillId={bill.childBillId}
        />
      }
      canBack
    >
      <ContentContainer loading={isFetchingBill}>
        <BillCreateOrUpdate canDelete={false} />
      </ContentContainer>
    </RootContainer>
  );
});
