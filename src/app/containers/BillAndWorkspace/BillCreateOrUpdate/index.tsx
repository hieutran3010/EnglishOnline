/**
 *
 * BillCreateOrUpdate
 *
 */

import React, { memo, useEffect, useCallback, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Form,
  DatePicker,
  Button,
  Divider,
  Space,
  Alert,
  Typography,
  Modal,
} from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import toNumber from 'lodash/fp/toNumber';
import find from 'lodash/fp/find';
import isEmpty from 'lodash/fp/isEmpty';
import keys from 'lodash/fp/keys';
import some from 'lodash/fp/some';
import toString from 'lodash/fp/toString';

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
  selectOldWeightInKg,
  selectPurchasePriceInfo,
  selectBillParams,
  selectBillId,
  selectBillStatus,
  selectSenderId,
  selectReceiverId,
} from './selectors';
import { StyledDateAndAssigneeContainer } from '../components/styles';
import FeeAndPrice from '../components/FeeAndPrice';
import PackageInfo from '../components/PackageInfo';
import CustomerInfo from '../components/CustomerInfo';
import ResponsibilityEmp from '../components/ResponsibilityEmp';
import Bill, { BILL_STATUS, PAYMENT_TYPE } from 'app/models/bill';
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
import { SubmitBillAction } from './types';

const { Text } = Typography;

const finalBillWarningModalConfig = {
  title:
    'Có vẻ bạn đang thiếu thông tin bắt buộc khi Chốt Bill, kiểm tra lại nhé:',
  content: (
    <div>
      <Space>
        <CheckOutlined />
        <Text>Mã bill hãng bay</Text>
      </Space>
      <Space>
        <CheckOutlined />
        <Text>Thông tin thanh toán khách hàng</Text>
      </Space>
      <Space>
        <CheckOutlined />
        <Text>Thông tin thanh toán cho nhà cung cấp</Text>
      </Space>
    </div>
  ),
};

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
    const [
      shouldRecalculatePurchasePrice,
      setShouldRecalculatePurchasePrice,
    ] = useState(false);
    const [isDirty, setIsDirty] = useState<boolean>(false);

    const billId = useSelector(selectBillId);
    const purchasePriceInfo = useSelector(selectPurchasePriceInfo);
    const oldWeightInKg = useSelector(selectOldWeightInKg);
    const billStatus = useSelector(selectBillStatus);
    const senderId = useSelector(selectSenderId);
    const receiverId = useSelector(selectReceiverId);

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
      setIsDirty(false);

      if (role !== Role.SALE) {
        dispatch(actions.fetchVendor());
        dispatch(actions.fetchResponsibilityUsers());
        dispatch(actions.fetchBillParams());
      }

      dispatch(actions.setBill(inputBill));

      billForm.setFieldsValue(inputBill);

      const formData: any = {};
      if (isEmpty(inputBill.id)) {
        formData.usdExchangeRate = billParams.usdExchangeRate;
      }

      const user = authStorage.getUser();
      switch (user.role) {
        case Role.LICENSE: {
          if (!inputBill.licenseUserId || isEmpty(inputBill.licenseUserId)) {
            formData.licenseUserId = user.id;
          }
          break;
        }
        case Role.ACCOUNTANT: {
          if (isEmpty(inputBill.id) && isEmpty(inputBill.accountantUserId)) {
            formData.accountantUserId = user.id;
          }
          break;
        }
        default:
          break;
      }

      if (role === Role.ADMIN || role === Role.ACCOUNTANT) {
        if (isEmpty(inputBill.vendorPaymentType)) {
          formData.vendorPaymentType = PAYMENT_TYPE.CASH;
        }

        if (isEmpty(inputBill.customerPaymentType)) {
          formData.customerPaymentType = PAYMENT_TYPE.CASH;
        }
      }

      updateBillFormData(formData, isEmpty(inputBill.id));

      setHasVat((inputBill.vat || 0) > 0);
      setShouldRecalculatePurchasePrice(false);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inputBill, role]);

    const getBillData = useCallback(() => {
      const bill = billForm.getFieldsValue();
      bill.salePrice = toNumber(bill.salePrice);
      bill.date = bill.date.format('YYYY-MM-DD HH:mm:ss');

      return bill as any;
    }, [billForm]);

    const getSubmitActionParams = useCallback((): SubmitBillAction => {
      const billData = getBillData();
      return { billFormValues: billData, isDirty };
    }, [getBillData, isDirty]);

    const updateBillFormData = useCallback(
      (data: any, skipSetDirty: boolean = false) => {
        if (!isEmpty(data)) {
          billForm.setFieldsValue(data);
          if (!skipSetDirty) {
            setIsDirty(true);
          }
        }
      },
      [billForm],
    );

    const onVendorSelectionChanged = useCallback(
      (vendorId: string | undefined) => {
        const vendor = find((v: Vendor) => v.id === vendorId)(vendors);
        if (vendor) {
          const { id } = vendor;
          dispatch(actions.fetchVendorCountries(id));

          updateBillFormData({
            vendorOtherFee: vendor.otherFeeInUsd,
            vendorFuelChargePercent: vendor.fuelChargePercent,
          });
        }
      },
      [dispatch, updateBillFormData, vendors],
    );

    const onSenderSelectionChanged = useCallback(
      (value: Customer) => {
        const { id, name, phone, address } = value;

        updateBillFormData({
          senderName: name,
          senderPhone: phone,
          senderAddress: address,
        });
        dispatch(actions.setSenderId(id));
      },
      [dispatch, updateBillFormData],
    );

    const onReceiverSelectionChanged = useCallback(
      (value: Customer) => {
        const { id, name, phone, address } = value;

        updateBillFormData({
          receiverName: name,
          receiverPhone: phone,
          receiverAddress: address,
        });
        dispatch(actions.setReceiverId(id));
      },
      [dispatch, updateBillFormData],
    );

    const onSubmitBill = useCallback(() => {
      const bill = getBillData();
      dispatch(actions.submitBill(bill));
      if (onSubmitting) onSubmitting(isBusy);
      setIsDirty(false);
    }, [getBillData, dispatch, onSubmitting, isBusy]);

    const onVatCheckingChanged = useCallback(
      (checked: boolean) => {
        setHasVat(checked);
        if (checked === true) {
          updateBillFormData({ vat: billParams.vat });
        } else {
          updateBillFormData({ vat: undefined });
        }
        setShouldRecalculatePurchasePrice(true);
      },
      [billParams.vat, updateBillFormData],
    );

    const onAssignToAccountant = useCallback(() => {
      dispatch(actions.assignToAccountant(getSubmitActionParams()));
      if (onSubmitting) onSubmitting(isBusy);
      setIsDirty(false);
    }, [dispatch, getSubmitActionParams, onSubmitting, isBusy]);

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
        setIsDirty(true);

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
          updateBillFormData({
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
          updateBillFormData({
            vendorPaymentDebt: vendorDebt > 0 ? vendorDebt : 0,
          });
        }
      },
      [billForm, shouldRecalculatePurchasePrice, updateBillFormData],
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

      const submitParams = getSubmitActionParams();
      const { billFormValues } = submitParams;
      const {
        airlineBillId,
        customerPaymentAmount,
        vendorPaymentAmount,
        customerPaymentType,
        vendorPaymentType,
        salePrice,
      } = billFormValues;

      if (
        isEmpty(airlineBillId) ||
        isEmpty(customerPaymentType) ||
        isEmpty(vendorPaymentType) ||
        customerPaymentAmount < salePrice ||
        vendorPaymentAmount <
          toNumber(purchasePriceInfo.purchasePriceAfterVatInVnd)
      ) {
        Modal.warning(finalBillWarningModalConfig);
        return;
      }

      showConfirm(
        'Bill sau khi chốt sẽ không thể chỉnh sửa, bạn có muốn tiếp tục?',
        () => {
          dispatch(actions.finalBill(submitParams));
          if (onSubmitting) onSubmitting(isBusy);
          setIsDirty(false);
        },
      );
    }, [
      billForm,
      dispatch,
      getSubmitActionParams,
      isBusy,
      onSubmitting,
      purchasePriceInfo.purchasePriceAfterVatInVnd,
    ]);

    const onAssignToLicense = useCallback(() => {
      dispatch(actions.assignLicense(getSubmitActionParams()));
      if (onSubmitting) onSubmitting(isBusy);
      setIsDirty(false);
    }, [dispatch, getSubmitActionParams, isBusy, onSubmitting]);

    const onVendorWeightChanged = useCallback(
      (
        oldWeight: number,
        newWeight: number,
        predictPurchasePrice: PurchasePriceCountingResult,
      ) => {
        updateBillFormData({ weightInKg: newWeight });
        dispatch(
          actions.updateNewWeight({
            oldWeight,
            newWeight,
            predictPurchasePrice,
          }),
        );
      },
      [dispatch, updateBillFormData],
    );

    const onRestoreSaleWeight = useCallback(
      (saleWeight: number, purchasePrice: PurchasePriceCountingResult) => {
        updateBillFormData({ weightInKg: saleWeight });
        dispatch(actions.restoreSaleWeight({ saleWeight, purchasePrice }));
      },
      [dispatch, updateBillFormData],
    );

    const onFinishFormFailed = useCallback(() => {
      toast.error('Vui lòng nhập đầy đủ thông tin');
    }, []);

    const onCustomerPaymentAmountFocused = useCallback(() => {
      const customerPaymentAmount = billForm.getFieldValue(
        'customerPaymentAmount',
      );

      if (isEmpty(toString(customerPaymentAmount))) {
        const salePrice = billForm.getFieldValue('salePrice');
        updateBillFormData({
          customerPaymentAmount: salePrice,
          customerPaymentDebt: 0,
        });
      }
    }, [billForm, updateBillFormData]);

    const onVendorPaymentAmountFocused = useCallback(() => {
      const vendorPaymentAmount = billForm.getFieldValue('vendorPaymentAmount');

      if (isEmpty(toString(vendorPaymentAmount))) {
        const purchasePrice = purchasePriceInfo.purchasePriceAfterVatInVnd;
        updateBillFormData({
          vendorPaymentAmount: purchasePrice,
          vendorPaymentDebt: 0,
        });
      }
    }, [
      billForm,
      purchasePriceInfo.purchasePriceAfterVatInVnd,
      updateBillFormData,
    ]);

    const billValidator = useMemo(() => getBillValidator(hasVat, billId), [
      hasVat,
      billId,
    ]);

    return (
      <>
        <Form
          form={billForm}
          {...layout}
          labelAlign="left"
          size="small"
          onFinish={onSubmitBill}
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
              <BillStatusTag status={billStatus} />
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
            oldWeightInKg={oldWeightInKg}
            onVendorWeightChanged={onVendorWeightChanged}
            onRestoreSaleWeight={onRestoreSaleWeight}
            billId={billId}
            billForm={billForm.getFieldsValue()}
            purchasePriceInUsd={purchasePriceInfo.purchasePriceInUsd || 0}
          />

          <FeeAndPrice
            billValidator={billValidator}
            onVatCheckingChanged={onVatCheckingChanged}
            hasVat={hasVat}
            purchasePriceInfo={purchasePriceInfo}
            shouldRecalculatePurchasePrice={shouldRecalculatePurchasePrice}
            onCalculatePurchasePrice={onCalculatePurchasePrice}
            isCalculating={isCalculatingPurchasePrice}
            disabledCalculation={
              isSubmitting || isAssigningAccountant || isDeletingBill
            }
          />

          {authorizeHelper.canRenderWithRole(
            [Role.ADMIN, Role.ACCOUNTANT],
            <Payment
              onCustomerPaymentAmountFocused={onCustomerPaymentAmountFocused}
              onVendorPaymentAmountFocused={onVendorPaymentAmountFocused}
            />,
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

                {billId && billStatus === BILL_STATUS.LICENSE && (
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

                {!isEmpty(billId) &&
                  billStatus === BILL_STATUS.ACCOUNTANT &&
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
                  !isEmpty(billId) &&
                  billStatus !== BILL_STATUS.DONE && (
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
                {isDirty && (
                  <Alert
                    banner
                    showIcon
                    message="Có thay đổi dữ liệu, nhớ bấm Lưu hoặc các nút bên cạnh để tránh mất dữ liệu!"
                  />
                )}
              </Space>
            </Form.Item>
          </div>
        </Form>
      </>
    );
  },
);