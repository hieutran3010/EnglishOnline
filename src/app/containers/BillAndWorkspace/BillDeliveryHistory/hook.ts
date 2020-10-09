import { SagaInjectionModes } from 'redux-injectors';

import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';
import { reducer, sliceKey, actions } from './slice';
import { billDeliveryHistorySaga } from './saga';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { FetchHistoriesCompletedAction } from './types';

const useBillDeliveryHistory = () => {
  const dispatch = useDispatch();

  useInjectReducer({ key: sliceKey, reducer: reducer });
  useInjectSaga({
    key: sliceKey,
    saga: billDeliveryHistorySaga,
    mode: SagaInjectionModes.RESTART_ON_REMOUNT,
  });

  const setHistories = useCallback((result: FetchHistoriesCompletedAction) => {
    dispatch(actions.fetchBillDeliveryHistoriesCompleted(result));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    setHistories,
  };
};

export default useBillDeliveryHistory;
