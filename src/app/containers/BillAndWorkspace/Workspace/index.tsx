/**
 *
 * Workspace
 *
 */

import React, { memo, useCallback, useEffect, useState } from 'react';
import { Button, Tabs } from 'antd';
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
  selectBillParams,
  selectNumberOfUncheckedVatBills,
  selectNeedToReloadWorkingBills,
} from './selectors';
import BillBlock from '../components/BillBlock';
import BillCreation from './BillCreation';
import BillView from '../components/BillView';
import VatPrintedChecking from '../components/VatPrintedChecking';
import { MyBills, UnassignedBills } from './WorkingBills';

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

  useInjectReducer({ key: sliceKey, reducer: reducer });
  useInjectSaga({ key: sliceKey, saga: workspaceSaga });

  const screenMode = useSelector(selectScreenMode);
  const collapsedMenu = useSelector(selectCollapsedMenu);

  const bill = useSelector(selectBill);
  const billParams = useSelector(selectBillParams);
  const numberOfUncheckedVatBills = useSelector(
    selectNumberOfUncheckedVatBills,
  );
  const needToReloadWorkingBills = useSelector(selectNeedToReloadWorkingBills);

  const [isBusy, setIsBusy] = useState(false);
  const [currentBillArea, setCurrentBillArea] = useState<
    SELECTED_BILL_AREA | undefined
  >();

  useEffect(() => {
    if (role !== Role.SALE) {
      dispatch(actions.fetchVendor());
      dispatch(actions.fetchResponsibilityUsers());
      dispatch(actions.fetchBillParams());
    }

    if (role === Role.ACCOUNTANT || role === Role.ADMIN) {
      dispatch(actions.fetchNumberOfUncheckedVatBill());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onBillSelectionChanged = useCallback(
    (billsArea: SELECTED_BILL_AREA) => (bill: Bill) => {
      if (!isEmpty(bill.vendorId)) {
        dispatch(actions.fetchVendorCountries(bill.vendorId));
      }

      dispatch(actions.submitBillSuccess(new Bill(bill)));
      setCurrentBillArea(billsArea);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const initNewBill = useCallback(() => {
    dispatch(actions.initNewBill());
    setCurrentBillArea(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCheckNumberOfVatBill = useCallback(() => {
    dispatch(actions.fetchNumberOfUncheckedVatBill());
  }, [dispatch]);

  const canEdit = canEditBill(role, bill);

  const renderMyBillBlock = (item: any) => {
    return (
      <BillBlock
        bill={item}
        onEdit={onBillSelectionChanged(SELECTED_BILL_AREA.MY_BILLS)}
        selectedBillId={bill.id}
      />
    );
  };

  const renderUnassignedBillBlock = (item: any) => {
    return (
      <BillBlock
        bill={item}
        onEdit={onBillSelectionChanged(SELECTED_BILL_AREA.UNASSIGNED)}
        selectedBillId={bill.id}
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
                <span>
                  {/* <Badge count={25} /> */}
                  {currentRole === Role.SALE
                    ? 'Bill của tôi'
                    : 'Bill tôi đang xử lý'}
                </span>
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
                  <span>
                    {/* <Badge count={25} /> */}
                    Bill chờ xử lý
                  </span>
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
          <ContentContainer>
            {canEdit && (
              <BillCreation
                bill={bill}
                billParams={billParams}
                onSubmitting={onBillSubmitting}
              />
            )}
            {!canEdit && <BillView bill={bill} />}
          </ContentContainer>
        </StyledRightContainer>
      </StyledContainer>
    </>
  );
});
