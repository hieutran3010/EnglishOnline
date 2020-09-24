import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';
import { reducer, sliceKey, actions } from './slice';
import { billViewPageSaga } from './saga';
import { selectIsSubmitting } from './selectors';
import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';

const useBillView = () => {
  useInjectReducer({ key: sliceKey, reducer: reducer });
  useInjectSaga({ key: sliceKey, saga: billViewPageSaga });

  const dispatch = useDispatch();

  const isBillActionsSubmitting = useSelector(selectIsSubmitting);

  const onArchiveBill = useCallback((billId: string) => {
    dispatch(actions.archiveBill({ billId }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRestoreArchivedBill = useCallback(
    (billId: string) => {
      dispatch(actions.restoreArchivedBill({ billId }));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const onCheckPrintedVatBill = useCallback(
    (billId: string) => {
      dispatch(actions.checkPrintedVatBill({ billId }));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const onReturnFinalBillToAccountant = useCallback(
    (billId: string) => {
      dispatch(actions.returnFinalBillToAccountant({ billId }));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const onForceDeleteBill = useCallback(
    (billId: string) => {
      dispatch(actions.forceDeleteBill({ billId }));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return {
    onArchiveBill,
    onRestoreArchivedBill,
    onCheckPrintedVatBill,
    onReturnFinalBillToAccountant,
    onForceDeleteBill,
    isBillActionsSubmitting,
  };
};

export { useBillView };
