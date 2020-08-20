/**
 *
 * BillCreateOrUpdate
 *
 */

import React, { memo, useEffect, useCallback, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Form, DatePicker, Button, Divider, Space, Alert } from 'antd';
import toNumber from 'lodash/fp/toNumber';
import find from 'lodash/fp/find';
import isEmpty from 'lodash/fp/isEmpty';
import keys from 'lodash/fp/keys';
import some from 'lodash/fp/some';

import type Customer from 'app/models/customer';
import type Vendor from 'app/models/vendor';
import {
  purchasePriceCountingFields,
  PurchasePriceCountingResult,
} from 'app/models/purchasePriceCounting';
import getBillValidator from 'app/models/validators/billValidator';
import { authStorage, authorizeHelper } from 'app/services/auth';
import { Role } from 'app/models/user';
import { showConfirm } from 'app/components/Modal/utils';

import { actions } from './slice';
import {
  selectVendors,
  selectIsFetchingVendor,
  selectVendorCountries,
  selectIsFetchingVendorCountries,
  selectIsSubmitting,
  selectIsFetchingResponsibilityUsers,
  selectUsers,
  selectIsAssigningAccountant,
  selectIsCalculatingPurchasePrice,
  selectIsDeletingBill,
  selectIsFinalBill,
  selectIsAssigningLicense,
  selectBill,
  selectBillParams,
} from './selectors';
import { StyledDateAndAssigneeContainer } from '../components/styles';
import FeeAndPrice from '../components/FeeAndPrice';
import PackageInfo from '../components/PackageInfo';
import CustomerInfo from '../components/CustomerInfo';
import ResponsibilityEmp from '../components/ResponsibilityEmp';
import Bill, { BILL_STATUS } from 'app/models/bill';
import BillStatusTag from '../components/BillStatusTag';
import Payment from '../components/Payment';
import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';
import { reducer, sliceKey } from './slice';
import { billCreateOrUpdateSaga } from './saga';
import { toast } from 'react-toastify';
import { SagaInjectionModes } from 'redux-injectors';
import { getMarginLeft } from 'app/components/Layout/AppLayout';
import { ScreenMode } from 'app/components/AppNavigation';
import {
  selectScreenMode,
  selectCollapsedMenu,
} from 'app/containers/HomePage/selectors';

const getStyle = (
  screenMode: ScreenMode,
  collapsedMenu: boolean,
  isFixedCommandBar?: boolean,
): React.CSSProperties | undefined => {
  if (isFixedCommandBar === true) {
    return {
      position: 'fixed',
      left: getMarginLeft(screenMode, collapsedMenu) + 320,
      right: 20,
      top: '93%',
      bottom: 10,
      background: 'white',
      display: 'flex',
      padding: 24,
      borderRadius: 5,
      boxShadow:
        '0px 1px 3px 0px rgba(0, 0, 0, 0.1), 0px 1px 2px 0px rgba(0, 0, 0, 0.06) ',
    };
  }
  return undefined;
};

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 18 },
};

interface Props {
  inputBill: Bill;
  onSubmitting?: (isSubmitting: boolean) => void;
  canDelete: boolean;
  isFixedCommandBar?: boolean;
}
export const BillCreateOrUpdate = memo(
  ({ inputBill, onSubmitting, canDelete, isFixedCommandBar }: Props) => {
    const role = authStorage.getRole();

    useInjectReducer({ key: sliceKey, reducer });
    useInjectSaga({
      key: sliceKey,
      saga: billCreateOrUpdateSaga,
      mode: SagaInjectionModes.RESTART_ON_REMOUNT,
    });

    const [hasVat, setHasVat] = useState(false);
    const [senderId, setSenderId] = useState<string | undefined>();
    const [receiverId, setReceiverId] = useState<string | undefined>();
    const [
      shouldRecalculatePurchasePrice,
      setShouldRecalculatePurchasePrice,
    ] = useState(false);
    const [hint, setHint] = useState<string>();

    const bill = useSelector(selectBill);
    const billParams = useSelector(selectBillParams);
    const vendors = useSelector(selectVendors);
    const isFetchingVendors = useSelector(selectIsFetchingVendor);
    const vendorCountries = useSelector(selectVendorCountries);
    const isFetchingVendorCountries = useSelector(
      selectIsFetchingVendorCountries,
    );
    const isSubmitting = useSelector(selectIsSubmitting);
    const isFetchingUsers = useSelector(selectIsFetchingResponsibilityUsers);
    const users = useSelector(selectUsers);
    const isAssigningAccountant = useSelector(selectIsAssigningAccountant);
    const isCalculatingPurchasePrice = useSelector(
      selectIsCalculatingPurchasePrice,
    );
    const isDeletingBill = useSelector(selectIsDeletingBill);
    const isFinalBill = useSelector(selectIsFinalBill);
    const isAssigningLicense = useSelector(selectIsAssigningLicense);

    const screenMode = useSelector(selectScreenMode);
    const collapsedMenu = useSelector(selectCollapsedMenu);

    const isBusy =
      isSubmitting ||
      isFinalBill ||
      isAssigningAccountant ||
      isAssigningLicense ||
      isDeletingBill;

    const dispatch = useDispatch();
    const [billForm] = Form.useForm();

    useEffect(() => {
      return function reset() {
        dispatch(actions.resetState());
      };
    }, [dispatch]);

    useEffect(() => {
      if (role !== Role.SALE) {
        dispatch(actions.fetchVendor());
        dispatch(actions.fetchResponsibilityUsers());
        dispatch(actions.fetchBillParams());
      }

      dispatch(actions.setBill(inputBill));
    }, [dispatch, inputBill, role]);

    useEffect(() => {
      billForm.setFieldsValue(bill);
      billForm.setFieldsValue({
        usdExchangeRate: bill.usdExchangeRate || billParams.usdExchangeRate,
      });

      const user = authStorage.getUser();
      switch (user.role) {
        case Role.LICENSE: {
          if (!bill.licenseUserId || isEmpty(bill.licenseUserId)) {
            billForm.setFieldsValue({ licenseUserId: user.id });
          }
          break;
        }
        case Role.ACCOUNTANT: {
          if (isEmpty(bill.id) && isEmpty(bill.accountantUserId)) {
            billForm.setFieldsValue({ accountantUserId: user.id });
          }
          break;
        }
        default:
          break;
      }

      setSenderId(bill.senderId);
      setReceiverId(bill.receiverId);
      setHasVat((bill.vat || 0) > 0);

      setShouldRecalculatePurchasePrice(false);
      setHint('');
    }, [bill, billForm, billParams.usdExchangeRate]);

    const onVendorSelectionChanged = useCallback(
      (vendorId: string | undefined) => {
        const vendor = find((v: Vendor) => v.id === vendorId)(vendors);
        if (vendor) {
          const { id } = vendor;
          dispatch(actions.fetchVendorCountries(id));

          billForm.setFieldsValue({
            vendorOtherFee: vendor.otherFeeInUsd,
            vendorFuelChargePercent: vendor.fuelChargePercent,
          });
        }
      },
      [billForm, dispatch, vendors],
    );

    const onSenderSelectionChanged = useCallback(
      (value: Customer) => {
        const { id, name, phone, address } = value;

        billForm.setFieldsValue({
          senderName: name,
          senderPhone: phone,
          senderAddress: address,
        });
        setSenderId(id);
      },
      [billForm],
    );

    const onReceiverSelectionChanged = useCallback(
      (value: Customer) => {
        const { id, name, phone, address } = value;

        billForm.setFieldsValue({
          receiverName: name,
          receiverPhone: phone,
          receiverAddress: address,
        });
        setReceiverId(id);
      },
      [billForm],
    );

    const getBillData = useCallback(() => {
      const bill = billForm.getFieldsValue();
      bill.salePrice = toNumber(bill.salePrice);
      bill.senderId = senderId;
      bill.receiverId = receiverId;
      bill.date = bill.date.format('YYYY-MM-DD HH:mm:ss');

      return bill as any;
    }, [billForm, receiverId, senderId]);

    const onBillSubmit = useCallback(() => {
      const bill = getBillData();
      dispatch(actions.submitBill(bill));
      if (onSubmitting) onSubmitting(isBusy);
      setHint('');
    }, [getBillData, dispatch, onSubmitting, isBusy]);

    const onVatCheckingChanged = useCallback(
      (checked: boolean) => {
        setHasVat(checked);
        if (checked === true) {
          billForm.setFieldsValue({ vat: billParams.vat });
        } else {
          billForm.setFieldsValue({ vat: undefined });
        }
        setShouldRecalculatePurchasePrice(true);
      },
      [billForm, billParams.vat],
    );

    const onAssignToAccountant = useCallback(() => {
      dispatch(actions.assignToAccountant());
      if (onSubmitting) onSubmitting(isBusy);
    }, [dispatch, onSubmitting, isBusy]);

    const onDeleteBill = useCallback(() => {
      showConfirm(
        'Bạn có chắc muốn xóa Bill này? Không thể phục hồi lại Bill sau khi xóa, xác nhận xóa?',
        () => {
          dispatch(actions.deleteBill());
          if (onSubmitting) onSubmitting(isBusy);
        },
      );
    }, [dispatch, isBusy, onSubmitting]);

    const onBillFormValuesChanged = useCallback(
      (changedValues, _allValues) => {
        setHint('Có thay đổi dữ liệu, nhớ bấm lưu để tránh mất dữ liệu!');

        const changedFields = keys(changedValues);

        // detect purchase price field changing
        if (shouldRecalculatePurchasePrice === false) {
          const hasChangedPurchasePriceCountingField = some((cf: string) =>
            purchasePriceCountingFields.includes(cf),
          )(changedFields);
          setShouldRecalculatePurchasePrice(
            hasChangedPurchasePriceCountingField,
          );
        }

        if (changedFields.includes('customerPaymentAmount')) {
          const salePrice = toNumber(billForm.getFieldValue('salePrice'));
          const customerPaymentAmount = toNumber(
            changedValues['customerPaymentAmount'],
          );
          billForm.setFieldsValue({
            customerPaymentDebt: salePrice - customerPaymentAmount,
          });
        }

        if (changedFields.includes('vendorPaymentAmount')) {
          const purchasePrice = toNumber(
            billForm.getFieldValue('purchasePriceAfterVatInVnd'),
          );
          const vendorPaymentAmount = toNumber(
            changedValues['vendorPaymentAmount'],
          );
          const vendorDebt = purchasePrice - vendorPaymentAmount;
          billForm.setFieldsValue({
            vendorPaymentDebt: vendorDebt > 0 ? vendorDebt : 0,
          });
        }
      },
      [billForm, shouldRecalculatePurchasePrice],
    );

    const onCalculatePurchasePrice = useCallback(() => {
      dispatch(actions.calculatePurchasePrice(getBillData()));
      setShouldRecalculatePurchasePrice(false);
    }, [dispatch, getBillData]);

    const onFinalBill = useCallback(async () => {
      try {
        await billForm.validateFields();
      } catch {
        toast.error('Vui lòng nhập đầy đủ thông tin trước khi chốt Bill');
        return;
      }

      showConfirm(
        'Bill sau khi chốt sẽ không thể chỉnh sửa, bạn có muốn tiếp tục?',
        () => {
          dispatch(actions.finalBill());
          if (onSubmitting) onSubmitting(isBusy);
        },
      );
    }, [billForm, dispatch, isBusy, onSubmitting]);

    const onAssignToLicense = useCallback(() => {
      dispatch(actions.assignLicense());
      if (onSubmitting) onSubmitting(isBusy);
    }, [dispatch, isBusy, onSubmitting]);

    const onVendorWeightChanged = useCallback(
      (
        newWeight: number,
        predictPurchasePrice: PurchasePriceCountingResult,
      ) => {
        dispatch(actions.updateNewWeight({ newWeight, predictPurchasePrice }));
      },
      [dispatch],
    );

    const onRestoreSaleWeight = useCallback(
      (saleWeight: number, purchasePrice: PurchasePriceCountingResult) => {
        dispatch(actions.restoreSaleWeight({ saleWeight, purchasePrice }));
      },
      [dispatch],
    );

    const onFinishFormFailed = useCallback(() => {
      toast.error('Vui lòng nhập đầy đủ thông tin');
    }, []);

    const billValidator = useMemo(() => getBillValidator(hasVat, bill.id), [
      hasVat,
      bill,
    ]);

    return (
      <Form
        form={billForm}
        {...layout}
        labelAlign="left"
        size="small"
        onFinish={onBillSubmit}
        initialValues={{ isSaveSender: true, isSaveReceiver: true }}
        onValuesChange={onBillFormValuesChanged}
        onFinishFailed={onFinishFormFailed}
      >
        <StyledDateAndAssigneeContainer>
          <Form.Item
            name="date"
            label=""
            wrapperCol={{ span: 25 }}
            rules={billValidator.date}
          >
            <DatePicker format="DD-MM-YYYY" />
          </Form.Item>
          <div>
            <BillStatusTag status={bill.status} />
          </div>
        </StyledDateAndAssigneeContainer>

        <Divider
          type="horizontal"
          orientation="center"
          style={{ marginTop: 0, marginBottom: 15 }}
        />

        <ResponsibilityEmp
          isFetchingUsers={isFetchingUsers}
          users={users}
          billValidator={billValidator}
        />

        <CustomerInfo
          billValidator={billValidator}
          onReceiverSelectionChanged={onReceiverSelectionChanged}
          onSenderSelectionChanged={onSenderSelectionChanged}
          senderId={senderId}
          receiverId={receiverId}
        />

        <PackageInfo
          isFetchingVendorCountries={isFetchingVendorCountries}
          isFetchingVendors={isFetchingVendors}
          vendors={vendors}
          onVendorSelectionChanged={onVendorSelectionChanged}
          billValidator={billValidator}
          vendorCountries={vendorCountries}
          userRole={role}
          bill={bill}
          onVendorWeightChanged={onVendorWeightChanged}
          onRestoreSaleWeight={onRestoreSaleWeight}
        />

        <FeeAndPrice
          billValidator={billValidator}
          onVatCheckingChanged={onVatCheckingChanged}
          hasVat={hasVat}
          bill={bill}
          shouldRecalculatePurchasePrice={shouldRecalculatePurchasePrice}
          onCalculatePurchasePrice={onCalculatePurchasePrice}
          isCalculating={isCalculatingPurchasePrice}
          disabledCalculation={
            isSubmitting || isAssigningAccountant || isDeletingBill
          }
        />

        {authorizeHelper.canRenderWithRole(
          [Role.ADMIN, Role.ACCOUNTANT],
          <Payment />,
        )}

        <div style={getStyle(screenMode, collapsedMenu, isFixedCommandBar)}>
          <Form.Item noStyle>
            <Space>
              <Button
                size="middle"
                type="primary"
                htmlType="submit"
                loading={isSubmitting}
                disabled={
                  isAssigningAccountant ||
                  isCalculatingPurchasePrice ||
                  isDeletingBill ||
                  isFinalBill ||
                  isAssigningLicense
                }
              >
                Lưu
              </Button>

              {bill.id && bill.status === BILL_STATUS.LICENSE && (
                <Button
                  size="middle"
                  type="ghost"
                  htmlType="button"
                  disabled={
                    isSubmitting ||
                    isCalculatingPurchasePrice ||
                    isDeletingBill ||
                    isFinalBill
                  }
                  loading={isAssigningAccountant}
                  onClick={onAssignToAccountant}
                >
                  Chuyển cho Kế Toán
                </Button>
              )}

              {!isEmpty(bill.id) &&
                bill.status === BILL_STATUS.ACCOUNTANT &&
                authorizeHelper.canRenderWithRole(
                  [Role.ACCOUNTANT, Role.ADMIN],
                  <>
                    <Button
                      size="middle"
                      type="ghost"
                      htmlType="button"
                      disabled={
                        isSubmitting ||
                        isCalculatingPurchasePrice ||
                        isDeletingBill ||
                        isFinalBill
                      }
                      loading={isAssigningLicense}
                      onClick={onAssignToLicense}
                    >
                      Chuyển cho Chứng Từ
                    </Button>
                    <Button
                      size="middle"
                      type="ghost"
                      htmlType="button"
                      onClick={onFinalBill}
                      loading={isFinalBill}
                      disabled={
                        isSubmitting ||
                        isCalculatingPurchasePrice ||
                        isAssigningAccountant ||
                        isDeletingBill ||
                        isAssigningLicense
                      }
                    >
                      Chốt Bill
                    </Button>
                  </>,
                )}

              {canDelete &&
                !isEmpty(bill.id) &&
                bill.status !== BILL_STATUS.DONE && (
                  <Button
                    size="middle"
                    type="primary"
                    htmlType="button"
                    loading={isDeletingBill}
                    disabled={
                      isSubmitting ||
                      isCalculatingPurchasePrice ||
                      isAssigningAccountant ||
                      isFinalBill ||
                      isAssigningLicense
                    }
                    danger
                    onClick={onDeleteBill}
                  >
                    Xóa Bill
                  </Button>
                )}
              {!isEmpty(hint) && <Alert banner showIcon message={hint} />}
            </Space>
          </Form.Item>
        </div>
      </Form>
    );
  },
);
