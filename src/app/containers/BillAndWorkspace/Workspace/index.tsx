/**
 *
 * Workspace
 *
 */

import React, { memo, useCallback, useEffect } from 'react';
import { Button, Space, Tooltip, Spin } from 'antd';
import { PlusCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import isEmpty from 'lodash/fp/isEmpty';

import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';
import { ContentContainer } from 'app/components/Layout';
import { authorizeHelper, authStorage } from 'app/services/auth';
import { Role } from 'app/models/user';
import Bill, { BILL_STATUS } from 'app/models/bill';
import {
  selectScreenMode,
  selectCollapsedMenu,
} from 'app/containers/HomePage/selectors';

import { workspaceSaga } from './saga';
import { actions, reducer, sliceKey } from './slice';

import {
  StyledContainer,
  StyledLeftContainer,
  StyledRightContainer,
  StyledGroupHeader,
  StyledMainToolbar,
} from './styles/StyledIndex';

import {
  selectIsFetchingMyBills,
  selectMyBills,
  selectBill,
  selectBillParams,
  selectNumberOfUncheckedVatBills,
  selectIsFetchingUnassignedBills,
  selectUnassignedBills,
} from './selectors';
import BillBlock from '../components/BillBlock';
import BillCreation from './BillCreation';
import BillView from '../components/BillView';
import VatPrintedChecking from '../components/VatPrintedChecking';
import WorkingBills from './WorkingBills';

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
  const currentRole = authStorage.getRole();

  const dispatch = useDispatch();

  useInjectReducer({ key: sliceKey, reducer: reducer });
  useInjectSaga({ key: sliceKey, saga: workspaceSaga });

  const screenMode = useSelector(selectScreenMode);
  const collapsedMenu = useSelector(selectCollapsedMenu);

  const isFetchingMyBills = useSelector(selectIsFetchingMyBills);
  const myBills = useSelector(selectMyBills);
  const isFetchingUnassignedBills = useSelector(
    selectIsFetchingUnassignedBills,
  );
  const unassignedBills = useSelector(selectUnassignedBills);
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

    if (role === Role.ACCOUNTANT || role === Role.ADMIN) {
      dispatch(actions.fetchNumberOfUncheckedVatBill());
      dispatch(actions.fetchUnassignedBills());
    }

    dispatch(actions.fetchMyBills());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let counter: any = undefined;
    if (role === Role.ACCOUNTANT || role === Role.ADMIN) {
      counter = setInterval(() => {
        dispatch(actions.fetchUnassignedBills());
      }, 30000);
    }

    return function cleanUp() {
      if (counter) {
        clearInterval(counter);
      }
    };
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
    <>
      {authorizeHelper.willRenderIfNot(
        [Role.SALE],
        <StyledMainToolbar>
          {authorizeHelper.canRenderWithRole(
            [Role.ACCOUNTANT, Role.LICENSE],
            <Button
              type="dashed"
              icon={<PlusCircleOutlined />}
              size="small"
              onClick={initNewBill}
              style={{ border: 0 }}
            >
              Tạo Bill Mới
            </Button>,
          )}
          {authorizeHelper.canRenderWithRole(
            [Role.ACCOUNTANT],
            <div style={{ marginBottom: 2 }}>
              <VatPrintedChecking
                numberOfBills={numberOfUncheckedVatBills}
                onCheckNumberOfVatBill={onCheckNumberOfVatBill}
              />
            </div>,
          )}
        </StyledMainToolbar>,
      )}
      <StyledContainer role={currentRole} {...{ screenMode, collapsedMenu }}>
        <StyledLeftContainer>
          <StyledGroupHeader>
            {currentRole === Role.SALE ? 'Bill của tôi' : 'Bill tôi đang xử lý'}
          </StyledGroupHeader>
          <div
            style={{
              height: [Role.ADMIN, Role.ACCOUNTANT].includes(currentRole)
                ? '50%'
                : '100%',
              overflow: 'auto',
              marginBottom: 10,
            }}
          >
            <WorkingBills
              renderBillBlock={renderBillBlock}
              isFetching={isFetchingMyBills}
              bills={myBills}
            />
          </div>
          {authorizeHelper.canRenderWithRole(
            [Role.ACCOUNTANT],
            <>
              <Space align="center">
                <StyledGroupHeader>Bill chờ xử lý</StyledGroupHeader>
                <Tooltip title="Tự động tải lại sau mỗi 10s">
                  <InfoCircleOutlined style={{ marginBottom: 5 }} />
                </Tooltip>
                {isFetchingUnassignedBills && <Spin size="small" />}
              </Space>
              <div
                style={{
                  height: '50%',
                  overflow: 'auto',
                  marginBottom: 10,
                }}
              >
                <WorkingBills
                  bills={unassignedBills}
                  renderBillBlock={renderBillBlock}
                />
              </div>
            </>,
          )}
        </StyledLeftContainer>
        <StyledRightContainer>
          <StyledGroupHeader>Thông tin bill</StyledGroupHeader>
          <ContentContainer>
            {canEdit && <BillCreation bill={bill} billParams={billParams} />}
            {!canEdit && <BillView bill={bill} />}
          </ContentContainer>
        </StyledRightContainer>
      </StyledContainer>
    </>
  );
});
