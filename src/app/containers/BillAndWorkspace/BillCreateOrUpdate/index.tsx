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
  Checkbox,
} from 'antd';
import { toast } from 'react-toastify';
import { CheckOutlined } from '@ant-design/icons';
import toNumber from 'lodash/fp/toNumber';
import find from 'lodash/fp/find';
import isEmpty from 'lodash/fp/isEmpty';
import keys from 'lodash/fp/keys';
import some from 'lodash/fp/some';
import toString from 'lodash/fp/toString';
import isUndefined from 'lodash/fp/isUndefined';
import isNil from 'lodash/fp/isNil';
import size from 'lodash/fp/size';
import head from 'lodash/fp/head';
import { SagaInjectionModes } from 'redux-injectors';
import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';

import type Customer from 'app/models/customer';
import type Vendor from 'app/models/vendor';
import {
  purchasePriceCountingFields,
  PurchasePriceCountingResult,
} from 'app/models/purchasePriceCounting';
import getBillValidator from 'app/models/validators/billValidator';
import { authStorage, authorizeHelper } from 'app/services/auth';
import { Role } from 'app/models/user';
import Bill, {
  BILL_STATUS,
  PAYMENT_TYPE,
  PurchasePriceInfo,
} from 'app/models/bill';
import Zone from 'app/models/zone';

import { getMarginLeft } from 'app/components/Layout/AppLayout';
import { ScreenMode } from 'app/components/AppNavigation';
import { showConfirm } from 'app/components/Modal/utils';
import {
  selectScreenMode,
  selectCollapsedMenu,
} from 'app/containers/HomePage/selectors';
import { ZONE_VENDOR_ASSOCIATION_SEPARATOR } from 'app/containers/VendorAndService/constants';

import { reducer, sliceKey } from './slice';
import { billCreateOrUpdateSaga } from './saga';
import { SubmitBillAction } from './types';
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
  selectServices,
  selectRelatedZones,
} from './selectors';
import BillQuotationModal from '../components/BillQuotationModal';
import { StyledDateAndAssigneeContainer } from '../components/styles';
import FeeAndPrice from '../components/FeeAndPrice';
import PackageInfo from '../components/PackageInfo';
import CustomerInfo from '../components/CustomerInfo';
import ResponsibilityEmp from '../components/ResponsibilityEmp';
import BillStatusTag from '../components/BillStatusTag';
import Payment from '../components/Payment';

const { Text } = Typography;

const finalBillWarningModalConfig = {
  title:
    'Có vẻ bạn đang thiếu thông tin bắt buộc khi Chốt Bill, kiểm tra lại theo các mục sau nhé:',
  content: (
    <div>
      <Space>
        <CheckOutlined style={{ marginBottom: 6 }} />
        <Text>Phải có Mã bill hãng bay hoặc Mã bill con</Text>
      </Space>
      <Space>
        <CheckOutlined style={{ marginBottom: 6 }} />
        <Text>
          {
            'Thanh toán của khách: Phải chọn hình thức thanh toán và Số tiền trả <= Giá bán'
          }
        </Text>
      </Space>
      <Space>
        <CheckOutlined style={{ marginBottom: 6 }} />
        <Text>
          {
            'Thanh toán NCC: Phải chọn hình thức thanh toán và Số tiền trả <= Giá mua'
          }
        </Text>
      </Space>
    </div>
  ),
};

const countPurchasePriceWarningConfig = {
  title: 'Để tính được Giá mua, vui lòng nhập ít nhất các thông tin sau đây:',
  content: (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Space>
        <CheckOutlined style={{ marginBottom: 6 }} />
        <Text>Nước Đến</Text>
      </Space>
      <Space>
        <CheckOutlined style={{ marginBottom: 6 }} />
        <Text>Dịch Vụ</Text>
      </Space>
      <Space>
        <CheckOutlined style={{ marginBottom: 6 }} />
        <Text>Trọng Lượng</Text>
      </Space>
      <Space>
        <CheckOutlined style={{ marginBottom: 6 }} />
        <Text>Tỉ Giá USD</Text>
      </Space>
    </div>
  ),
};

const getStyle = (
  screenMode: ScreenMode,
  collapsedMenu: boolean,
  hasSubActionsBar: boolean,
  isFixedCommandBar?: boolean,
): React.CSSProperties | undefined => {
  if (isFixedCommandBar === true) {
    return {
      position: 'fixed',
      left: getMarginLeft(screenMode, collapsedMenu) + 320,
      right: 20,
      top: hasSubActionsBar ? '88%' : '93%',
      bottom: 10,
    };
  }
  return undefined;
};

const actionBarStyle: React.CSSProperties | undefined = {
  padding: 24,
  paddingTop: 14,
  paddingBottom: 14,
  borderRadius: 5,
  boxShadow:
    '0px 1px 3px 0px rgba(0, 0, 0, 0.1), 0px 1px 2px 0px rgba(0, 0, 0, 0.06) ',
  display: 'flex',
  background: 'white',
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
    const [
      shouldCountPurchasePriceWithLatestQuotation,
      setShouldCountPurchasePriceWithLatestQuotation,
    ] = useState<boolean>(false);
    const [forceUsingLatestQuotation, setForceUsingLatestQuotation] = useState(
      false,
    );

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

    const services = useSelector(selectServices);
    const relatedZones = useSelector(selectRelatedZones);

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
        setIsDirty(false);
        setShouldRecalculatePurchasePrice(false);
        setForceUsingLatestQuotation(false);

        dispatch(actions.resetState());
        billForm.resetFields();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      setIsDirty(false);

      if (role !== Role.SALE) {
        dispatch(actions.fetchVendor());
        dispatch(actions.fetchResponsibilityUsers());
        dispatch(actions.fetchBillParams());

        if (!isEmpty(inputBill.id) && !isEmpty(inputBill.vendorId)) {
          dispatch(actions.fetchVendorCountries(inputBill.vendorId));
          dispatch(actions.fetchServices(inputBill.vendorId));
          dispatch(
            actions.fetchRelatedZones({
              vendorId: inputBill.vendorId,
              destinationCountry: inputBill.destinationCountry,
            }),
          );
        }
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
          if (isEmpty(inputBill.licenseUserId)) {
            formData.licenseUserId = user.id;
          }
          break;
        }
        case Role.ACCOUNTANT: {
          if (isEmpty(inputBill.accountantUserId)) {
            formData.accountantUserId = user.id;
            if (!isEmpty(inputBill.id)) {
              toast.info(
                'Phần mềm đã tự động chỉ định bạn là kế toán của bill này, bấm Lưu để lưu lại!',
              );
            }
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
      setShouldCountPurchasePriceWithLatestQuotation(
        isEmpty(inputBill.billQuotations) || isNil(inputBill.billQuotations),
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inputBill, role]);

    useEffect(() => {
      const usdExchangeRate = billForm.getFieldValue('usdExchangeRate');
      if (!usdExchangeRate || usdExchangeRate <= 0) {
        billForm.setFieldsValue({
          usdExchangeRate: billParams.usdExchangeRate || 0,
        });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [billParams.usdExchangeRate, inputBill.id]);

    useEffect(() => {
      if (size(relatedZones) === 1) {
        const z = head(relatedZones) as Zone;
        if (z.name.includes(ZONE_VENDOR_ASSOCIATION_SEPARATOR)) {
          const [serviceName] = z.name.split(ZONE_VENDOR_ASSOCIATION_SEPARATOR);
          billForm.setFieldsValue({ internationalParcelVendor: serviceName });
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [relatedZones]);

    const getBillData = useCallback(() => {
      const bill = billForm.getFieldsValue();
      bill.salePrice = toNumber(bill.salePrice);
      bill.date = bill.date.hour(23).minute(0).format('YYYY-MM-DD HH:mm');

      return bill as any;
    }, [billForm]);

    const getSubmitActionParams = useCallback(async (): Promise<
      SubmitBillAction | undefined
    > => {
      try {
        await billForm.validateFields();
        const billData = getBillData();
        return { billFormValues: billData, isDirty };
      } catch {
        toast.error('Vui lòng nhập đầy đủ thông tin');
        return undefined;
      }
    }, [billForm, getBillData, isDirty]);

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

          const destinationCountry = billForm.getFieldValue(
            'destinationCountry',
          );
          dispatch(actions.fetchVendorCountries(id));
          dispatch(actions.fetchServices(id));
          dispatch(
            actions.fetchRelatedZones({
              vendorId,
              destinationCountry,
            }),
          );

          updateBillFormData({
            vendorOtherFee: vendor.otherFeeInUsd,
            vendorFuelChargePercent: vendor.fuelChargePercent,
          });

          if (inputBill && inputBill.id) {
            const { vendorId } = purchasePriceInfo;
            setForceUsingLatestQuotation(vendorId !== id);
          }
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [inputBill, purchasePriceInfo, updateBillFormData, vendors],
    );

    const onSelectedCountryChanged = useCallback(
      (country?: string) => {
        const vendorId = billForm.getFieldValue('vendorId');
        dispatch(
          actions.fetchRelatedZones({
            vendorId,
            destinationCountry: country,
          }),
        );
      },
      [billForm, dispatch],
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

    const onAssignToAccountant = useCallback(async () => {
      const submitParams = await getSubmitActionParams();
      if (!submitParams) {
        return;
      }

      dispatch(actions.assignToAccountant(submitParams));
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

        if (
          changedFields.includes('senderName') ||
          changedFields.includes('senderPhone') ||
          changedFields.includes('senderAddress')
        ) {
          dispatch(actions.setSenderId(undefined));
        }

        if (
          changedFields.includes('receiverName') ||
          changedFields.includes('receiverPhone') ||
          changedFields.includes('receiverAddress')
        ) {
          dispatch(actions.setReceiverId(undefined));
        }
      },
      [billForm, dispatch, shouldRecalculatePurchasePrice, updateBillFormData],
    );

    const onCalculatePurchasePriceCompleted = useCallback(
      (newPrice: PurchasePriceCountingResult) => {
        setShouldRecalculatePurchasePrice(false);
        setIsDirty(true);
        setShouldCountPurchasePriceWithLatestQuotation(false);
        setForceUsingLatestQuotation(false);

        if (newPrice) {
          billForm.setFieldsValue({
            vendorPaymentDebt:
              newPrice.purchasePriceAfterVatInVnd -
              (billForm.getFieldValue('vendorPaymentAmount') || 0),
          });
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [],
    );

    const onCalculatePurchasePrice = useCallback(() => {
      const billData = getBillData();

      const {
        destinationCountry,
        weightInKg,
        usdExchangeRate,
        internationalParcelVendor,
      } = billData;
      if (
        isEmpty(internationalParcelVendor) ||
        isEmpty(destinationCountry) ||
        isUndefined(weightInKg) ||
        isNil(weightInKg) ||
        isUndefined(usdExchangeRate) ||
        isNil(usdExchangeRate) ||
        usdExchangeRate <= 0
      ) {
        Modal.warning(countPurchasePriceWarningConfig);
        return;
      }

      const isGetLatestQuotation =
        forceUsingLatestQuotation ||
        isNil(purchasePriceInfo.billQuotations) ||
        isEmpty(purchasePriceInfo.billQuotations) ||
        shouldCountPurchasePriceWithLatestQuotation;

      dispatch(
        actions.calculatePurchasePrice({
          billForm: billData,
          isGetLatestQuotation,
          callback: onCalculatePurchasePriceCompleted,
        }),
      );
    }, [
      dispatch,
      getBillData,
      forceUsingLatestQuotation,
      onCalculatePurchasePriceCompleted,
      purchasePriceInfo.billQuotations,
      shouldCountPurchasePriceWithLatestQuotation,
    ]);

    const onFinalBill = useCallback(async () => {
      const submitParams = await getSubmitActionParams();
      if (!submitParams) {
        return;
      }

      const { billFormValues } = submitParams;
      const {
        airlineBillId,
        childBillId,
        customerPaymentAmount,
        vendorPaymentAmount,
        customerPaymentType,
        vendorPaymentType,
        salePrice,
      } = billFormValues;

      const purchasePrice = toNumber(
        purchasePriceInfo.purchasePriceAfterVatInVnd,
      );
      if (
        (isEmpty(airlineBillId) && isEmpty(childBillId)) ||
        isEmpty(customerPaymentType) ||
        isEmpty(vendorPaymentType) ||
        (salePrice > 0 &&
          (customerPaymentAmount <= 0 || customerPaymentAmount > salePrice)) ||
        (purchasePrice > 0 &&
          (vendorPaymentAmount <= 0 || vendorPaymentAmount > purchasePrice))
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
      dispatch,
      getSubmitActionParams,
      isBusy,
      onSubmitting,
      purchasePriceInfo.purchasePriceAfterVatInVnd,
    ]);

    const onAssignToLicense = useCallback(async () => {
      const submitParams = await getSubmitActionParams();
      if (!submitParams) {
        return;
      }

      dispatch(actions.assignLicense(submitParams));
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
            isUseLatestQuotation: shouldCountPurchasePriceWithLatestQuotation,
          }),
        );
      },
      [
        dispatch,
        shouldCountPurchasePriceWithLatestQuotation,
        updateBillFormData,
      ],
    );

    const onPurchasePriceManuallyChanged = useCallback(
      (manuallyPurchasePrice: PurchasePriceInfo) => {
        dispatch(actions.setPurchasePriceManually(manuallyPurchasePrice));
        setIsDirty(true);
      },
      [dispatch],
    );

    const onRestoreSaleWeight = useCallback(
      (saleWeight: number, purchasePrice: PurchasePriceCountingResult) => {
        updateBillFormData({ weightInKg: saleWeight });
        dispatch(
          actions.restoreSaleWeight({
            saleWeight,
            purchasePrice,
            isUseLatestQuotation: shouldCountPurchasePriceWithLatestQuotation,
          }),
        );
      },
      [
        dispatch,
        shouldCountPurchasePriceWithLatestQuotation,
        updateBillFormData,
      ],
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

    const onShouldCountPurchasePriceWithLatestQuotationChanged = useCallback(
      e => {
        setShouldCountPurchasePriceWithLatestQuotation(e.target.checked);
      },
      [],
    );

    const onServiceChanged = useCallback(
      value => {
        const { service } = purchasePriceInfo;
        setForceUsingLatestQuotation(value !== service);
      },
      [purchasePriceInfo],
    );

    const billValidator = useMemo(() => getBillValidator(hasVat, billId), [
      hasVat,
      billId,
    ]);

    const hasSubActionsBar =
      !isEmpty(purchasePriceInfo.billQuotations) &&
      !isNil(purchasePriceInfo.billQuotations);

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
            onSelectedCountryChanged={onSelectedCountryChanged}
            billValidator={billValidator}
            vendorCountries={vendorCountries}
            userRole={role}
            oldWeightInKg={oldWeightInKg}
            onVendorWeightChanged={onVendorWeightChanged}
            onRestoreSaleWeight={onRestoreSaleWeight}
            billId={billId}
            billForm={billForm.getFieldsValue()}
            purchasePriceInUsd={purchasePriceInfo.purchasePriceInUsd || 0}
            billQuotations={purchasePriceInfo.billQuotations}
            isUseLatestQuotation={shouldCountPurchasePriceWithLatestQuotation}
            services={services}
            relatedZones={relatedZones}
            onServiceChanged={onServiceChanged}
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
            userRole={role}
            onPurchasePriceManuallyChanged={onPurchasePriceManuallyChanged}
          />

          {authorizeHelper.canRenderWithRole(
            [Role.ADMIN, Role.ACCOUNTANT],
            <Payment
              onCustomerPaymentAmountFocused={onCustomerPaymentAmountFocused}
              onVendorPaymentAmountFocused={onVendorPaymentAmountFocused}
            />,
          )}

          <div
            style={getStyle(
              screenMode,
              collapsedMenu,
              hasSubActionsBar,
              isFixedCommandBar,
            )}
          >
            {hasSubActionsBar && (
              <div
                style={{
                  ...actionBarStyle,
                  paddingTop: 5,
                  paddingBottom: 5,
                  marginBottom: 5,
                }}
              >
                <Form.Item noStyle>
                  <Space>
                    <Checkbox
                      checked={
                        shouldCountPurchasePriceWithLatestQuotation ||
                        forceUsingLatestQuotation
                      }
                      onChange={
                        onShouldCountPurchasePriceWithLatestQuotationChanged
                      }
                    >
                      Tính theo báo giá mới nhất
                    </Checkbox>
                    <BillQuotationModal
                      purchasePriceInfo={purchasePriceInfo}
                      bill={billForm.getFieldsValue()}
                    />
                  </Space>
                </Form.Item>
              </div>
            )}
            <div style={actionBarStyle}>
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
          </div>
        </Form>
      </>
    );
  },
);
