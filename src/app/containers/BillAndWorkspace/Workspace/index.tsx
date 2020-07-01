/**
 *
 * Workspace
 *
 */

import React, { memo, useCallback, useEffect } from 'react';
import { List, Button, Space } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import isEmpty from 'lodash/fp/isEmpty';

import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';
import { ContentContainer } from 'app/components/Layout';
import { authorizeHelper, authStorage } from 'app/services/auth';
import { Role } from 'app/models/user';
import Bill, { BILL_STATUS } from 'app/models/bill';

import { workspaceSaga } from './saga';
import { actions, reducer, sliceKey } from './slice';

import {
  StyledContainer,
  StyledLeftContainer,
  StyledRightContainer,
  StyledGroupHeader,
} from './styles/StyledIndex';

import {
  selectIsFetchingMyBills,
  selectMyBills,
  selectBill,
  selectBillParams,
  selectNumberOfUncheckedVatBills,
} from './selectors';
import UnassignedBills from './UnassignedBills';
import BillBlock from '../components/BillBlock';
import BillCreation from './BillCreation';
import BillView from '../components/BillView';
import VatPrintedChecking from '../components/VatPrintedChecking';

const canEditBill = (role: Role, bill: Bill) => {
  switch (role) {
    case Role.LICENSE: {
      return bill.status === BILL_STATUS.LICENSE || isEmpty(bill.id);
    }
    case Role.ACCOUNTANT: {
      return bill.status === BILL_STATUS.ACCOUNTANT || isEmpty(bill.id);
    }
    case Role.ADMIN: {
      return true;
    }
    case Role.SALE: {
      return false;
    }
  }
};

export const Workspace = memo(() => {
  const role = authStorage.getRole();

  const dispatch = useDispatch();

  useInjectReducer({ key: sliceKey, reducer: reducer });
  useInjectSaga({ key: sliceKey, saga: workspaceSaga });

  const isFetchingMyBills = useSelector(selectIsFetchingMyBills);
  const myBills = useSelector(selectMyBills);
  const bill = useSelector(selectBill);
  const billParams = useSelector(selectBillParams);
  const numberOfUncheckedVatBills = useSelector(
    selectNumberOfUncheckedVatBills,
  );

  useEffect(() => {
    if (role !== Role.SALE) {
      dispatch(actions.fetchVendor());
      dispatch(actions.fetchResponsibilityUsers());
      dispatch(actions.fetchBillParams());
    }

    dispatch(actions.fetchMyBills());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onBillSelectionChanged = useCallback((bill: Bill) => {
    dispatch(actions.submitBillSuccess(new Bill(bill)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initNewBill = useCallback(() => {
    dispatch(actions.initNewBill());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCheckNumberOfVatBill = useCallback(() => {
    dispatch(actions.fetchNumberOfUncheckedVatBill());
  }, [dispatch]);

  const canEdit = canEditBill(role, bill);

  const renderBillBlock = (bill: any) => {
    return <BillBlock bill={bill} onEdit={onBillSelectionChanged} />;
  };
  return (
    <StyledContainer>
      <StyledLeftContainer>
        <StyledGroupHeader>Bill đang xử lý</StyledGroupHeader>
        <div style={{ maxHeight: 321, overflow: 'auto' }}>
          <List
            renderItem={renderBillBlock}
            loading={isFetchingMyBills}
            dataSource={myBills}
          />
        </div>
        {authorizeHelper.willRenderIfNot(
          [Role.SALE],
          <>
            <div style={{ flex: 1, overflow: 'auto' }}>
              <UnassignedBills
                onBillSelectionChanged={onBillSelectionChanged}
              />
            </div>
          </>,
        )}
      </StyledLeftContainer>

      <StyledRightContainer>
        <Space style={{ marginBottom: 10 }}>
          {authorizeHelper.willRenderIfNot(
            [Role.SALE],
            <Button danger size="large" onClick={initNewBill}>
              Tạo Bill Mới
            </Button>,
          )}
          {authorizeHelper.canRenderWithRole(
            [Role.ADMIN, Role.ACCOUNTANT],
            <VatPrintedChecking
              numberOfBills={numberOfUncheckedVatBills}
              onCheckNumberOfVatBill={onCheckNumberOfVatBill}
            />,
          )}
        </Space>

        <ContentContainer>
          {canEdit && <BillCreation bill={bill} billParams={billParams} />}
          {!canEdit && <BillView bill={bill} />}
        </ContentContainer>
      </StyledRightContainer>
    </StyledContainer>
  );
});
