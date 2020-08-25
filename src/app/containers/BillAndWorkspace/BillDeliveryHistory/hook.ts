import { SagaInjectionModes } from 'redux-injectors';

import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';
import { reducer, sliceKey } from './slice';
import { billDeliveryHistorySaga } from './saga';

const useBillDeliveryHistory = () => {
  useInjectReducer({ key: sliceKey, reducer: reducer });
  useInjectSaga({
    key: sliceKey,
    saga: billDeliveryHistorySaga,
    mode: SagaInjectionModes.RESTART_ON_REMOUNT,
  });
};

export default useBillDeliveryHistory;
