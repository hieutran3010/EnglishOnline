/**
 *
 * BillView
 *
 */

import React, { memo, useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Bill from 'app/models/bill';

import { actions } from './slice';
import BillView from '../components/BillView';
import { selectIsSubmitting } from './selectors';

interface Props {
  bill: Bill;
  onActionExecuteCompleted?: () => void;
}
export const BillViewPage = memo(
  ({ bill, onActionExecuteCompleted }: Props) => {
    const dispatch = useDispatch();

    const isSubmitting = useSelector(selectIsSubmitting);

    const [selectedBill, setSelectedBill] = useState<Bill>(new Bill());

    useEffect(() => {
      setSelectedBill(bill);
    }, [bill]);

    const onArchiveBill = useCallback(
      (billId: string) => {
        dispatch(
          actions.archiveBill({
            billId,
            succeededCallback: onActionExecuteCompleted,
          }),
        );
      },
      [dispatch, onActionExecuteCompleted],
    );

    const onPrintedVatBill = useCallback(
      (billId: string) => {
        dispatch(
          actions.checkPrintedVatBill({
            billId,
            succeededCallback: onActionExecuteCompleted,
          }),
        );
      },
      [dispatch, onActionExecuteCompleted],
    );

    const onRestoreArchivedBill = useCallback(
      (billId: string) => {
        dispatch(
          actions.restoreArchivedBill({
            billId,
            succeededCallback: onActionExecuteCompleted,
          }),
        );
      },
      [dispatch, onActionExecuteCompleted],
    );

    const onReturnFinalBillToAccountant = useCallback(
      (billId: string) => {
        dispatch(
          actions.returnFinalBillToAccountant({
            billId,
            succeededCallback: onActionExecuteCompleted,
          }),
        );
      },
      [dispatch, onActionExecuteCompleted],
    );

    const onForceDeleteBill = useCallback(
      (billId: string) => {
        dispatch(
          actions.forceDeleteBill({
            billId,
            succeededCallback: onActionExecuteCompleted,
          }),
        );
      },
      [dispatch, onActionExecuteCompleted],
    );

    return (
      <BillView
        bill={selectedBill}
        onArchiveBill={onArchiveBill}
        onPrintedVat={onPrintedVatBill}
        onRestoreArchivedBill={onRestoreArchivedBill}
        onReturnFinalBillToAccountant={onReturnFinalBillToAccountant}
        onForceDeleteBill={onForceDeleteBill}
        isSubmitting={isSubmitting}
      />
    );
  },
);
