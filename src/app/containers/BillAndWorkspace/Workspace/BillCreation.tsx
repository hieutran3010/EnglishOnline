/**
 *
 * Workspace
 *
 */

import React, { memo, useEffect, useCallback, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Form, DatePicker, Button, Divider, Space } from 'antd';
import toNumber from 'lodash/fp/toNumber';
import find from 'lodash/fp/find';
import isEmpty from 'lodash/fp/isEmpty';
import keys from 'lodash/fp/keys';
import some from 'lodash/fp/some';

import type Customer from 'app/models/customer';
import type Vendor from 'app/models/vendor';
import { purchasePriceCountingFields } from 'app/models/purchasePriceCounting';
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
} from './selectors';
import { StyledDateAndAssigneeContainer } from './styles/StyledIndex';
import FeeAndPrice from '../components/FeeAndPrice';
import PackageInfo from '../components/PackageInfo';
import CustomerInfo from '../components/CustomerInfo';
import ResponsibilityEmp from '../components/ResponsibilityEmp';
import Bill, { BILL_STATUS } from 'app/models/bill';
import BillStatusTag from '../components/BillStatusTag';
import Payment from '../components/Payment';
import { BillParams } from 'app/models/appParam';

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 18 },
};
interface Props {
  bill: Bill;
  billParams: BillParams;
}
const BillCreation = ({ bill, billParams }: Props) => {
  const [hasVat, setHasVat] = useState(false);
  const [senderId, setSenderId] = useState<string | undefined>();
  const [receiverId, setReceiverId] = useState<string | undefined>();
  const [
    shouldRecalculatePurchasePrice,
    setShouldRecalculatePurchasePrice,
  ] = useState(false);

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

  const dispatch = useDispatch();
  const [billForm] = Form.useForm();

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
  }, [bill, billForm, billParams]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [vendors],
  );

  const onSenderSelectionChanged = useCallback((value: Customer) => {
    const { id, name, phone, address } = value;

    billForm.setFieldsValue({
      senderName: name,
      senderPhone: phone,
      senderAddress: address,
    });
    setSenderId(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onReceiverSelectionChanged = useCallback((value: Customer) => {
    const { id, name, phone, address } = value;

    billForm.setFieldsValue({
      receiverName: name,
      receiverPhone: phone,
      receiverAddress: address,
    });
    setReceiverId(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getBillData = useCallback(() => {
    const bill = billForm.getFieldsValue();
    bill.salePrice = toNumber(bill.salePrice);
    bill.senderId = senderId;
    bill.receiverId = receiverId;
    bill.date = bill.date.format('YYYY-MM-DD HH:mm:ss');

    return bill as any;
  }, [billForm, receiverId, senderId]);

  const onBillSubmit = useCallback(
    () => {
      const bill = getBillData();
      dispatch(actions.submitBill(bill));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [senderId, receiverId],
  );

  const onVatCheckingChanged = useCallback(
    (checked: boolean) => {
      setHasVat(checked);
      if (checked === true) {
        billForm.setFieldsValue({ vat: billParams.vat });
      } else {
        billForm.setFieldsValue({ vat: undefined });
      }
    },
    [billForm, billParams.vat],
  );

  const onAssignToAccountant = useCallback(() => {
    dispatch(actions.assignToAccountant());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDeleteBill = useCallback(() => {
    showConfirm(
      'Bạn có chắc muốn xóa Bill này? Không thể phục hồi lại Bill sau khi xóa, xác nhận xóa?',
      () => {
        dispatch(actions.deleteBill());
      },
    );
  }, [dispatch]);

  const onBillFormValuesChanged = useCallback(
    (changedValues, _allValues) => {
      const changedFields = keys(changedValues);

      // detect purchase price field changing
      if (shouldRecalculatePurchasePrice === false) {
        const hasChangedPurchasePriceCountingField = some((cf: string) =>
          purchasePriceCountingFields.includes(cf),
        )(changedFields);
        setShouldRecalculatePurchasePrice(hasChangedPurchasePriceCountingField);
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
    await billForm.validateFields();
    showConfirm(
      'Bill sau khi chốt sẽ không thể chỉnh sửa, bạn có muốn tiếp tục?',
      () => {
        dispatch(actions.finalBill());
      },
    );
  }, [billForm, dispatch]);

  const onAssignToLicense = useCallback(() => {
    dispatch(actions.assignLicense());
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      <Form.Item>
        <Space>
          <Button
            size="large"
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
              size="large"
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
                  size="large"
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
                  size="large"
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

          {!isEmpty(bill.id) && bill.status !== BILL_STATUS.DONE && (
            <Button
              size="large"
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
        </Space>
      </Form.Item>
    </Form>
  );
};

export default memo(BillCreation);
