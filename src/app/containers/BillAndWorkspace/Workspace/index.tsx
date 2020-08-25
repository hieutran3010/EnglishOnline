/**
 *
 * Workspace
 *
 */

import React, { memo, useCallback, useEffect, useState } from 'react';
import { Button, Tabs, Tooltip } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
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
  StyledMainToolbar,
} from './styles/StyledIndex';

import {
  selectBill,
  selectNumberOfUncheckedVatBills,
  selectNeedToReloadWorkingBills,
} from './selectors';
import BillBlock, { BILL_BLOCK_ACTION_TYPE } from '../components/BillBlock';
import BillView from '../components/BillView';
import VatPrintedChecking from '../components/VatPrintedChecking';
import { MyBills, UnassignedBills } from './WorkingBills';
import { BillCreateOrUpdate } from '../BillCreateOrUpdate';
import { SagaInjectionModes } from 'redux-injectors';
import { BillDeliveryHistoryPage } from '../BillDeliveryHistory';
import useBillDeliveryHistory from '../BillDeliveryHistory/hook';

enum SELECTED_BILL_AREA {
  MY_BILLS = 0,
  UNASSIGNED,
}

const { TabPane } = Tabs;

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
  useBillDeliveryHistory();

  useInjectReducer({ key: sliceKey, reducer: reducer });
  useInjectSaga({
    key: sliceKey,
    saga: workspaceSaga,
    mode: SagaInjectionModes.RESTART_ON_REMOUNT,
  });

  const screenMode = useSelector(selectScreenMode);
  const collapsedMenu = useSelector(selectCollapsedMenu);

  const bill = useSelector(selectBill);
  const numberOfUncheckedVatBills = useSelector(
    selectNumberOfUncheckedVatBills,
  );
  const needToReloadWorkingBills = useSelector(selectNeedToReloadWorkingBills);

  const [isBusy, setIsBusy] = useState(false);
  const [currentBillArea, setCurrentBillArea] = useState<
    SELECTED_BILL_AREA | undefined
  >();

  const [billBlockActionType, setBillBlockActionType] = useState(
    BILL_BLOCK_ACTION_TYPE.EDIT_OR_VIEW,
  );

  useEffect(() => {
    if (role === Role.ACCOUNTANT || role === Role.ADMIN) {
      dispatch(actions.fetchNumberOfUncheckedVatBill());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initNewBill = useCallback(() => {
    dispatch(actions.initNewBill());
    setCurrentBillArea(SELECTED_BILL_AREA.MY_BILLS);
    setBillBlockActionType(BILL_BLOCK_ACTION_TYPE.EDIT_OR_VIEW);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCheckNumberOfVatBill = useCallback(() => {
    dispatch(actions.fetchNumberOfUncheckedVatBill());
  }, [dispatch]);

  const onBillSelectionChanged = useCallback(
    (billsArea: SELECTED_BILL_AREA) => (selectedBill: Bill) => {
      dispatch(actions.selectBill(selectedBill));
      setCurrentBillArea(billsArea);
      setBillBlockActionType(BILL_BLOCK_ACTION_TYPE.EDIT_OR_VIEW);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const onSelectForDeliveryHistory = useCallback(
    (selectedBill: Bill) => {
      dispatch(actions.selectBill(selectedBill));
      setCurrentBillArea(SELECTED_BILL_AREA.MY_BILLS);
      setBillBlockActionType(BILL_BLOCK_ACTION_TYPE.HISTORY);
    },
    [dispatch],
  );

  const canEdit = canEditBill(role, bill);

  const renderMyBillBlock = (item: any) => {
    return (
      <BillBlock
        bill={item}
        onSelect={onBillSelectionChanged(SELECTED_BILL_AREA.MY_BILLS)}
        selectedBillId={bill.id}
        userRole={role}
        onSelectForDeliveryHistory={onSelectForDeliveryHistory}
      />
    );
  };

  const renderUnassignedBillBlock = (item: any) => {
    return (
      <BillBlock
        bill={item}
        onSelect={onBillSelectionChanged(SELECTED_BILL_AREA.UNASSIGNED)}
        selectedBillId={bill.id}
        userRole={role}
      />
    );
  };

  const onBillSubmitting = useCallback((isSubmitting: boolean) => {
    setIsBusy(isSubmitting);
  }, []);

  const onDataReloaded = useCallback(() => {
    dispatch(actions.setNeedToReloadWorkingBills(false));
  }, [dispatch]);

  return (
    <>
      <StyledContainer role={currentRole} {...{ screenMode, collapsedMenu }}>
        <StyledLeftContainer>
          <Tabs defaultActiveKey="1" size="small">
            <TabPane
              tab={
                <Tooltip title="Bill có tôi là Sale hoặc là Chứng Từ hoặc là Kế Toán">
                  <span>
                    {/* <Badge count={25} /> */}
                    Bill của tôi
                  </span>
                </Tooltip>
              }
              key="1"
              disabled={isBusy}
            >
              <MyBills
                renderBillBlock={renderMyBillBlock}
                needToReload={
                  needToReloadWorkingBills === true &&
                  currentBillArea !== undefined
                }
                onReloaded={onDataReloaded}
              />
            </TabPane>
            {authorizeHelper.canRenderWithRole(
              [Role.ACCOUNTANT],
              <TabPane
                tab={
                  <Tooltip title="Bill chưa có Kế Toán làm">
                    <span>
                      {/* <Badge count={25} /> */}
                      Bill chờ xử lý
                    </span>
                  </Tooltip>
                }
                key="2"
                disabled={isBusy}
              >
                <UnassignedBills
                  renderBillBlock={renderUnassignedBillBlock}
                  needToReload={
                    needToReloadWorkingBills === true &&
                    currentBillArea === SELECTED_BILL_AREA.UNASSIGNED
                  }
                  onReloaded={onDataReloaded}
                />
              </TabPane>,
            )}
          </Tabs>
        </StyledLeftContainer>
        <StyledRightContainer>
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
          {currentRole !== Role.SALE && <div style={{ marginTop: 54 }}></div>}
          {billBlockActionType === BILL_BLOCK_ACTION_TYPE.EDIT_OR_VIEW && (
            <ContentContainer style={{ marginBottom: canEdit ? 65 : 0 }}>
              {canEdit && (
                <BillCreateOrUpdate
                  inputBill={bill}
                  canDelete
                  onSubmitting={onBillSubmitting}
                  isFixedCommandBar
                />
              )}
              {!canEdit && <BillView bill={bill} />}
            </ContentContainer>
          )}
          {billBlockActionType === BILL_BLOCK_ACTION_TYPE.HISTORY && (
            <BillDeliveryHistoryPage size="small" bill={bill} />
          )}
        </StyledRightContainer>
      </StyledContainer>
    </>
  );
});
