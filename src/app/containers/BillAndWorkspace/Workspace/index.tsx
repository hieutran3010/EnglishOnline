/**
 *
 * Workspace
 *
 */

import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { List, Button, Input, Tooltip } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import isEmpty from 'lodash/fp/isEmpty';
import trim from 'lodash/fp/trim';
import filter from 'lodash/fp/filter';
import toString from 'lodash/fp/toString';
import toLower from 'lodash/fp/toLower';

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
  const currentRole = authStorage.getRole();

  const dispatch = useDispatch();

  useInjectReducer({ key: sliceKey, reducer: reducer });
  useInjectSaga({ key: sliceKey, saga: workspaceSaga });

  const screenMode = useSelector(selectScreenMode);
  const collapsedMenu = useSelector(selectCollapsedMenu);

  const isFetchingMyBills = useSelector(selectIsFetchingMyBills);
  const myBills = useSelector(selectMyBills);
  const bill = useSelector(selectBill);
  const billParams = useSelector(selectBillParams);
  const numberOfUncheckedVatBills = useSelector(
    selectNumberOfUncheckedVatBills,
  );

  const [myBillsFilterKey, setMyBillsFilterKey] = useState('');

  useEffect(() => {
    if (role !== Role.SALE) {
      dispatch(actions.fetchVendor());
      dispatch(actions.fetchResponsibilityUsers());
      dispatch(actions.fetchBillParams());
    }

    if (role === Role.ACCOUNTANT || role === Role.ADMIN) {
      dispatch(actions.fetchNumberOfUncheckedVatBill());
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

  const onSearchMyBills = useCallback(value => {
    setMyBillsFilterKey(trim(value));
  }, []);
  const filteredMyBills = useMemo(() => {
    if (!isEmpty(myBillsFilterKey)) {
      const lowerFilter = toLower(myBillsFilterKey);
      return filter(
        (b: Bill) =>
          toString(b.airlineBillId).includes(lowerFilter) ||
          toString(b.childBillId).includes(lowerFilter) ||
          toLower(b.senderName).includes(lowerFilter) ||
          toLower(b.senderPhone).includes(lowerFilter),
      )(myBills);
    }

    return myBills;
  }, [myBills, myBillsFilterKey]);

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
          <Tooltip title="Nhập bill hãng bay hoặc bill con hoặc số điện thoại/tên khách gởi sau đó nhấn Enter để tìm">
            <Input.Search
              style={{ marginBottom: 5, marginTop: 2 }}
              placeholder="Tìm bill"
              onSearch={onSearchMyBills}
              enterButton
              size="small"
              allowClear
            />
          </Tooltip>
          <div
            style={{
              height: [Role.ADMIN, Role.ACCOUNTANT].includes(currentRole)
                ? '50%'
                : '100%',
              overflow: 'auto',
              marginBottom: 10,
            }}
          >
            <List
              renderItem={renderBillBlock}
              loading={isFetchingMyBills}
              dataSource={filteredMyBills}
            />
          </div>
          {authorizeHelper.canRenderWithRole(
            [Role.ACCOUNTANT],
            <>
              <div
                style={{
                  height: '50%',
                  overflow: 'auto',
                  marginBottom: 10,
                }}
              >
                <UnassignedBills
                  onBillSelectionChanged={onBillSelectionChanged}
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
