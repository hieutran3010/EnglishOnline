/**
 *
 * Workspace
 *
 */

import React, { memo, useCallback, useEffect, useState } from 'react';
import { Button, Drawer } from 'antd';
import { PlusCircleOutlined, ContainerOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { SagaInjectionModes } from 'redux-injectors';
import { isMobile } from 'react-device-detect';

import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';
import { ContentContainer } from 'app/components/Layout';
import { authorizeHelper, authStorage } from 'app/services/auth';
import { Role } from 'app/models/user';
import Bill, { BillDeliveryHistory } from 'app/models/bill';
import {
  selectScreenMode,
  selectCollapsedMenu,
} from 'app/containers/HomePage/selectors';

import { workspaceSaga } from './saga';
import { actions, reducer, sliceKey } from './slice';
import { actions as billCreateOrUpdateAction } from '../BillCreateOrUpdate/slice';
import { BillDeliveryHistoryPage } from '../BillDeliveryHistory';
import useBillDeliveryHistory from '../BillDeliveryHistory/hook';

import {
  StyledContainer,
  StyledRightContainer,
  StyledMainToolbar,
} from './styles/StyledIndex';

import {
  selectNumberOfUncheckedVatBills,
  selectMyBills,
  selectIsLoadingMyBills,
  selectTotalMyBills,
  selectSelectedMonth,
  selectTotalSelfCreatedBillsToday,
} from './selectors';
import BillBlock, { BILL_BLOCK_ACTION_TYPE } from '../components/BillBlock';
import VatPrintedChecking from '../components/VatPrintedChecking';
import { BillCreateOrUpdate } from '../BillCreateOrUpdate';
import { checkCanEditHistory } from '../utils';
import get from 'lodash/fp/get';
import { ScreenMode } from 'app/components/AppNavigation/types';
import MyBills from './MyBills';

export const Workspace = memo(() => {
  const role = authStorage.getRole();
  const currentRole = authStorage.getRole();
  const [isBusy, setIsBusy] = useState(false);
  const [selectedBillId, setSelectedBillId] = useState<string | undefined>();
  const [visibleBillListDrawer, setVisibleBillListDrawer] = useState(false);

  const dispatch = useDispatch();
  const { setHistories } = useBillDeliveryHistory();

  useInjectReducer({ key: sliceKey, reducer: reducer });
  useInjectSaga({
    key: sliceKey,
    saga: workspaceSaga,
    mode: SagaInjectionModes.RESTART_ON_REMOUNT,
  });

  useEffect(() => {
    dispatch(actions.fetchMyBills());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const screenMode = useSelector(selectScreenMode);
  const collapsedMenu = useSelector(selectCollapsedMenu);

  const numberOfUncheckedVatBills = useSelector(
    selectNumberOfUncheckedVatBills,
  );
  const myBills = useSelector(selectMyBills);
  const isLoadingMyBills = useSelector(selectIsLoadingMyBills);
  const totalMyBills = useSelector(selectTotalMyBills);
  const selectedMonth = useSelector(selectSelectedMonth);
  const totalSelfCreatedBillsToday = useSelector(
    selectTotalSelfCreatedBillsToday,
  );

  const [billBlockActionType, setBillBlockActionType] = useState(
    BILL_BLOCK_ACTION_TYPE.EDIT_OR_VIEW,
  );

  const [canEditHistory, setCanEditHistory] = useState(false);

  useEffect(() => {
    if (role === Role.ACCOUNTANT || role === Role.ADMIN) {
      dispatch(actions.fetchNumberOfUncheckedVatBill());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initNewBill = useCallback(() => {
    dispatch(billCreateOrUpdateAction.initNewBill());
    setBillBlockActionType(BILL_BLOCK_ACTION_TYPE.EDIT_OR_VIEW);
    setSelectedBillId(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCheckNumberOfVatBill = useCallback(() => {
    dispatch(actions.fetchNumberOfUncheckedVatBill());
  }, [dispatch]);

  const onBillSelectionChanged = useCallback(
    (selectedBill: Bill) => {
      dispatch(billCreateOrUpdateAction.setBill(selectedBill));
      setBillBlockActionType(BILL_BLOCK_ACTION_TYPE.EDIT_OR_VIEW);
      setSelectedBillId(selectedBill.id);

      if (screenMode !== ScreenMode.FULL) {
        setVisibleBillListDrawer(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [screenMode],
  );

  const onSelectForDeliveryHistory = useCallback(
    (selectedBill: Bill) => {
      const { airlineBillId, childBillId } = selectedBill;
      setHistories({
        billId: selectedBill.id,
        airlineBillId,
        childBillId,
        histories: (get('billDeliveryHistories')(selectedBill) ||
          []) as BillDeliveryHistory[],
      });
      setBillBlockActionType(BILL_BLOCK_ACTION_TYPE.HISTORY);
      setSelectedBillId(selectedBill.id);

      setCanEditHistory(checkCanEditHistory(role, selectedBill.saleUserId));

      if (screenMode !== ScreenMode.FULL) {
        setVisibleBillListDrawer(false);
      }
    },
    [role, screenMode, setHistories],
  );

  const renderMyBillBlock = useCallback(
    (item: Bill & any) => {
      return (
        <BillBlock
          key={item.id}
          bill={item}
          onView={onBillSelectionChanged}
          selectedBillId={selectedBillId}
          onViewOrEditDeliveryHistory={onSelectForDeliveryHistory}
          dateBackgroundColor={item.dateGroupColor}
          isBusy={isBusy}
          bordered={isMobile}
        />
      );
    },
    [
      isBusy,
      onBillSelectionChanged,
      onSelectForDeliveryHistory,
      selectedBillId,
    ],
  );

  const onBillSubmitting = useCallback((isSubmitting: boolean) => {
    setIsBusy(isSubmitting);
  }, []);

  const onFetchMoreMyBills = useCallback(() => {
    dispatch(actions.fetchMoreMyBills());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onMonthChanged = useCallback((month: number) => {
    dispatch(actions.changeMonth(month));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearchMyBills = useCallback((searchKey: string) => {
    dispatch(actions.search(searchKey));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onReloadMyBills = useCallback(() => {
    dispatch(actions.fetchMyBills(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCountTotalMyBillsCreatedToday = useCallback(() => {
    dispatch(actions.fetchTotalMyBillsCreatedToday());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onVisibleBillsInDrawer = useCallback(() => {
    setVisibleBillListDrawer(true);
  }, []);

  const onCloseBillsDrawer = useCallback(() => {
    setVisibleBillListDrawer(false);
  }, []);

  return (
    <StyledContainer role={currentRole} {...{ screenMode, collapsedMenu }}>
      {!isMobile && (
        <MyBills
          renderMyBillBlock={renderMyBillBlock}
          isLoadingMyBills={isLoadingMyBills}
          myBills={myBills}
          onCountTotalMyBillsCreatedToday={onCountTotalMyBillsCreatedToday}
          onFetchMoreMyBills={onFetchMoreMyBills}
          onMonthChanged={onMonthChanged}
          onReloadMyBills={onReloadMyBills}
          onSearchMyBills={onSearchMyBills}
          selectedMonth={selectedMonth}
          totalMyBills={totalMyBills}
          totalSelfCreatedBillsToday={totalSelfCreatedBillsToday}
          style={{ marginRight: 20, width: 400 }}
          role={role}
        />
      )}
      <StyledRightContainer>
        {(isMobile || role !== Role.SALE) && (
          <StyledMainToolbar>
            {isMobile && (
              <div>
                <Button
                  type="primary"
                  ghost
                  icon={<ContainerOutlined />}
                  size="small"
                  onClick={onVisibleBillsInDrawer}
                  style={{ border: 0, boxShadow: 'none' }}
                >
                  DS Bills
                </Button>
                <Drawer
                  placement="right"
                  onClose={onCloseBillsDrawer}
                  visible={visibleBillListDrawer}
                  width={320}
                  bodyStyle={{ padding: 10 }}
                  closable={false}
                >
                  <MyBills
                    renderMyBillBlock={renderMyBillBlock}
                    isLoadingMyBills={isLoadingMyBills}
                    myBills={myBills}
                    onCountTotalMyBillsCreatedToday={
                      onCountTotalMyBillsCreatedToday
                    }
                    onFetchMoreMyBills={onFetchMoreMyBills}
                    onMonthChanged={onMonthChanged}
                    onReloadMyBills={onReloadMyBills}
                    onSearchMyBills={onSearchMyBills}
                    selectedMonth={selectedMonth}
                    totalMyBills={totalMyBills}
                    totalSelfCreatedBillsToday={totalSelfCreatedBillsToday}
                    role={role}
                  />
                </Drawer>
              </div>
            )}

            {authorizeHelper.canRenderWithRole(
              [Role.ACCOUNTANT, Role.LICENSE],
              <Button
                type="dashed"
                icon={<PlusCircleOutlined />}
                size="small"
                onClick={initNewBill}
                style={{ border: 0, boxShadow: 'none' }}
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
          </StyledMainToolbar>
        )}

        {billBlockActionType === BILL_BLOCK_ACTION_TYPE.EDIT_OR_VIEW && (
          <ContentContainer
            size="small"
            bodyStyle={{ paddingBottom: 0, height: 'unset' }}
          >
            <BillCreateOrUpdate
              canDelete
              onSubmitting={onBillSubmitting}
              billViewStyle={{ marginBottom: 10 }}
            />
          </ContentContainer>
        )}
        {billBlockActionType === BILL_BLOCK_ACTION_TYPE.HISTORY && (
          <BillDeliveryHistoryPage
            size="small"
            isReadOnly={!canEditHistory}
            delegateControl
            notAbleToViewBillInfo
          />
        )}
      </StyledRightContainer>
    </StyledContainer>
  );
});
