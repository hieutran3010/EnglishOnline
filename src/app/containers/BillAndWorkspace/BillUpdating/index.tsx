/**
 *
 * BillUpdating
 *
 */

import React, { memo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';
import { reducer, sliceKey, actions } from './slice';
import { selectIsFetchingBill, selectBill } from './selectors';
import { billUpdatingSaga } from './saga';
import { RootContainer, ContentContainer } from 'app/components/Layout';
import { BillCreateOrUpdate } from '../BillCreateOrUpdate';
import { useParams } from 'react-router-dom';

interface Props {}

export const BillUpdating = memo((props: Props) => {
  useInjectReducer({ key: sliceKey, reducer: reducer });
  useInjectSaga({ key: sliceKey, saga: billUpdatingSaga });

  const { billId } = useParams();
  const dispatch = useDispatch();

  const isFetchingBill = useSelector(selectIsFetchingBill);
  const bill = useSelector(selectBill);

  useEffect(() => {
    dispatch(actions.fetchBill(billId));
  }, [billId, dispatch]);

  return (
    <RootContainer
      title={`Cập nhật bill ${bill.airlineBillId ?? '<chưa có bill hãng bay>'}`}
    >
      <ContentContainer loading={isFetchingBill}>
        <BillCreateOrUpdate inputBill={bill} canDelete={false} />
      </ContentContainer>
    </RootContainer>
  );
});
