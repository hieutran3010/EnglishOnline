import React, { memo, useCallback, useMemo } from 'react';
import moment from 'moment';
import {
  Divider,
  Typography,
  Descriptions,
  Button,
  Space,
  Tag,
  Tooltip,
  Spin,
  Modal,
  Row,
  Col,
} from 'antd';
import isUndefined from 'lodash/fp/isUndefined';
import isNil from 'lodash/fp/isNil';

import Bill, { BILL_STATUS, PAYMENT_TYPE } from 'app/models/bill';
import { toCurrency } from 'utils/numberFormat';
import { authorizeHelper } from 'app/services/auth';
import { Role } from 'app/models/user';

import BillStatusTag from './BillStatusTag';
import PurchasePrice from './PurchasePrice';
import UserAvatar from 'app/containers/Auth/components/UserAvatar';
import { showConfirm } from 'app/components/Modal/utils';

const { Title, Text } = Typography;

const paymentTypeDisplay = {
  [PAYMENT_TYPE.CASH]: 'Tiền mặt',
  [PAYMENT_TYPE.BANK_TRANSFER]: 'Chuyển khoản',
  [PAYMENT_TYPE.CASH_AND_BANK_TRANSFER]: 'Tiền mặt & Chuyển khoản',
};

interface Props {
  bill: Bill;
  onArchiveBill?: (billId: string) => void;
  onPrintedVat?: (billId: string) => void;
  onRestoreArchivedBill?: (billId: string) => void;
  onReturnFinalBillToAccountant?: (billId: string) => void;
  onForceDeleteBill?: (billId: string) => void;
  isSubmitting?: boolean;
}
const BillView = ({
  bill,
  onArchiveBill,
  onPrintedVat,
  onRestoreArchivedBill,
  onReturnFinalBillToAccountant,
  onForceDeleteBill,
  isSubmitting,
}: Props) => {
  const onRequestPrintedVat = useCallback(() => {
    if (onPrintedVat) {
      onPrintedVat(bill.id);
    }
  }, [bill, onPrintedVat]);

  const purchasePriceInfo = useMemo(() => {
    return new Bill(bill).getPurchasePriceInfo();
  }, [bill]);

  const _onRestoreArchivedBill = useCallback(() => {
    if (onRestoreArchivedBill) {
      onRestoreArchivedBill(bill.id);
    }
  }, [bill.id, onRestoreArchivedBill]);

  const _onReturnFinalBillToAccountant = useCallback(() => {
    if (onReturnFinalBillToAccountant) {
      onReturnFinalBillToAccountant(bill.id);
    }
  }, [bill.id, onReturnFinalBillToAccountant]);

  const _onForceDeleteBill = useCallback(() => {
    if (onForceDeleteBill) {
      showConfirm(
        `Bạn có chắc muốn xóa bill này, bill sau khi xóa không thể phục hồi, tiếp tục xóa?`,
        () => {
          onForceDeleteBill(bill.id);
        },
      );
    }
  }, [bill.id, onForceDeleteBill]);

  const _onArchiveBill = useCallback(() => {
    showConfirm(
      `Bạn có chắc muốn hủy bill ${
        bill.airlineBillId || bill.childBillId
      }? Bill này sẽ không được dùng trong các loại báo cáo cũng như không được hiển thị nữa!`,
      () => {
        onArchiveBill && onArchiveBill(bill.id);
      },
    );
  }, [bill.airlineBillId, bill.childBillId, bill.id, onArchiveBill]);

  return (
    <>
      <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
        <Col span={24}>
          <Space
            size="small"
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
            }}
          >
            {onForceDeleteBill &&
              authorizeHelper.canRenderWithRole(
                [Role.ADMIN],
                <Button
                  type="primary"
                  danger
                  size="small"
                  onClick={_onForceDeleteBill}
                >
                  Xóa
                </Button>,
              )}

            {onArchiveBill &&
              bill.status === BILL_STATUS.DONE &&
              !bill.isArchived &&
              authorizeHelper.canRenderWithRole(
                [Role.ACCOUNTANT, Role.ADMIN],
                <Button danger onClick={_onArchiveBill} size="small">
                  Hủy
                </Button>,
              )}

            {onRestoreArchivedBill &&
              bill.isArchived &&
              authorizeHelper.canRenderWithRole(
                [Role.ADMIN],
                <Button danger size="small" onClick={_onRestoreArchivedBill}>
                  Khôi phục
                </Button>,
              )}

            {onReturnFinalBillToAccountant &&
              !bill.isArchived &&
              bill.status === BILL_STATUS.DONE &&
              authorizeHelper.canRenderWithRole(
                [Role.ADMIN],
                <Button
                  type="primary"
                  ghost
                  size="small"
                  onClick={_onReturnFinalBillToAccountant}
                >
                  Trả lại Kế Toán
                </Button>,
              )}

            {bill.status === BILL_STATUS.DONE &&
              !bill.isArchived &&
              (bill.vat || 0) > 0 &&
              !bill.isPrintedVatBill &&
              onPrintedVat &&
              authorizeHelper.canRenderWithRole(
                [Role.ADMIN, Role.ACCOUNTANT],
                <Button
                  type="primary"
                  ghost
                  size="small"
                  style={{ marginRight: 2, marginLeft: 2 }}
                  onClick={onRequestPrintedVat}
                >
                  Xuất VAT
                </Button>,
              )}
          </Space>
        </Col>
      </Row>

      <Divider
        type="horizontal"
        orientation="center"
        style={{ margin: '17px 0' }}
      />
      <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
        <Col span={24}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text strong>{moment(bill.date).format('DD-MM-YYYY')}</Text>
            <BillStatusTag status={bill.status} />
            <Space size="small">
              {bill.isArchived && <Tag color="red">Đã Bị Hủy</Tag>}
              {bill.isPrintedVatBill && <Tag color="red">Đã xuất VAT</Tag>}
            </Space>
          </div>
        </Col>
      </Row>

      <Divider
        type="horizontal"
        orientation="center"
        style={{ margin: '17px 0' }}
      />

      <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
        <Col
          xs={{ span: 24 }}
          sm={{ span: 24 }}
          md={{ span: 8 }}
          lg={{ span: 8 }}
        >
          <UserAvatar
            title="Sale"
            userId={bill.saleUserId}
            type="displayNameWithLabel"
          />
        </Col>
        <Col
          xs={{ span: 24 }}
          sm={{ span: 24 }}
          md={{ span: 8 }}
          lg={{ span: 8 }}
        >
          <UserAvatar
            title="Chứng Từ"
            userId={bill.licenseUserId}
            type="displayNameWithLabel"
          />
        </Col>
        <Col
          xs={{ span: 24 }}
          sm={{ span: 24 }}
          md={{ span: 8 }}
          lg={{ span: 8 }}
        >
          <UserAvatar
            title="Kế Toán"
            userId={bill.accountantUserId}
            type="displayNameWithLabel"
          />
        </Col>
      </Row>

      <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
        <Col
          xs={{ span: 24 }}
          sm={{ span: 24 }}
          md={{ span: 12 }}
          lg={{ span: 12 }}
        >
          <Title level={4} type="secondary" style={{ marginTop: 10 }}>
            Khách gởi
          </Title>
          <Descriptions size="small" bordered layout="horizontal" column={1}>
            <Descriptions.Item label="Tên" style={{ width: 43 }}>
              {bill.senderName}&nbsp;
            </Descriptions.Item>
            <Descriptions.Item label="Số ĐT">
              {bill.senderPhone}&nbsp;
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">
              {bill.senderAddress}&nbsp;
            </Descriptions.Item>
          </Descriptions>
        </Col>
        <Col
          xs={{ span: 24 }}
          sm={{ span: 24 }}
          md={{ span: 12 }}
          lg={{ span: 12 }}
        >
          <Title level={4} type="secondary" style={{ marginTop: 10 }}>
            Khách nhận
          </Title>
          <Descriptions
            size="small"
            bordered
            layout="horizontal"
            column={1}
            style={{ marginTop: 10 }}
          >
            <Descriptions.Item label="Tên" style={{ width: 43 }}>
              {bill.receiverName}&nbsp;
            </Descriptions.Item>
            <Descriptions.Item label="Số ĐT">
              {bill.receiverPhone}&nbsp;
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">
              {bill.receiverAddress}&nbsp;
            </Descriptions.Item>
          </Descriptions>
        </Col>
      </Row>

      <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} style={{ marginTop: 10 }}>
        <Col span={24}>
          <Title level={4} type="secondary">
            Thông tin hàng
          </Title>
          <Descriptions size="small" bordered column={1}>
            <Descriptions.Item label="Bill hãng bay">
              {bill.airlineBillId}
            </Descriptions.Item>
            <Descriptions.Item label="Bill con">
              {bill.childBillId}
            </Descriptions.Item>
            <Descriptions.Item label="Nhà cung cấp">
              {bill.vendorName}
            </Descriptions.Item>
            <Descriptions.Item label="Loại hàng">
              {bill.description}
            </Descriptions.Item>
            <Descriptions.Item label="Trọng lượng (kg)">
              <Space>
                <Text>{bill.weightInKg}kg</Text>
                {!isUndefined(bill.oldWeightInKg) &&
                  !isNil(bill.oldWeightInKg) && (
                    <Tooltip title="Ký bán cho khách">
                      <Text delete>{bill.oldWeightInKg}kg</Text>
                    </Tooltip>
                  )}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Dịch vụ">
              {bill.internationalParcelVendor}
            </Descriptions.Item>
            <Descriptions.Item label="Nước đến">
              {bill.destinationCountry}
            </Descriptions.Item>
          </Descriptions>
        </Col>
      </Row>

      {authorizeHelper.willRenderIfNot(
        [Role.LICENSE],
        <>
          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
            <Col span={24}>
              <Title level={4} type="secondary" style={{ marginTop: 10 }}>
                Phí & Giá
              </Title>
              <Descriptions size="small" bordered column={1}>
                {authorizeHelper.canRenderWithRole(
                  [Role.ACCOUNTANT, Role.ADMIN],
                  <Descriptions.Item label="Giá mua">
                    <PurchasePrice info={purchasePriceInfo} />
                  </Descriptions.Item>,
                )}
                <Descriptions.Item label="Giá bán">
                  {toCurrency(bill.salePrice || 0)}
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
            <Col
              xs={{ span: 24 }}
              sm={{ span: 24 }}
              md={{ span: 12 }}
              lg={{ span: 12 }}
            >
              <Title level={4} type="secondary" style={{ marginTop: 10 }}>
                Khách Hàng Thanh Toán
              </Title>
              <Descriptions size="small" bordered layout="vertical">
                <Descriptions.Item label="Hình thức">
                  {paymentTypeDisplay[bill.customerPaymentType as string]}
                </Descriptions.Item>
                <Descriptions.Item label="Đã thanh toán">
                  {bill.customerPaymentType ===
                  PAYMENT_TYPE.CASH_AND_BANK_TRANSFER
                    ? `TM: ${toCurrency(
                        bill.customerPaymentAmount || 0,
                      )} - CK: ${toCurrency(
                        bill.otherCustomerPaymentAmount || 0,
                      )}`
                    : toCurrency(bill.customerPaymentAmount || 0)}
                </Descriptions.Item>
                <Descriptions.Item label="Còn nợ">
                  {toCurrency(bill.customerPaymentDebt || 0)}
                </Descriptions.Item>
              </Descriptions>
            </Col>
            {authorizeHelper.canRenderWithRole(
              [Role.ACCOUNTANT, Role.ADMIN],
              <Col
                xs={{ span: 24 }}
                sm={{ span: 24 }}
                md={{ span: 12 }}
                lg={{ span: 12 }}
              >
                <Title level={4} type="secondary" style={{ marginTop: 10 }}>
                  Thanh Toán NCC
                </Title>
                <Descriptions size="small" bordered layout="vertical">
                  <Descriptions.Item label="Hình thức">
                    {paymentTypeDisplay[bill.vendorPaymentType as string]}
                  </Descriptions.Item>
                  <Descriptions.Item label="Đã thanh toán">
                    {toCurrency(bill.vendorPaymentAmount || 0)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Còn nợ">
                    {toCurrency(bill.vendorPaymentDebt || 0)}
                  </Descriptions.Item>
                </Descriptions>
              </Col>,
            )}
          </Row>
        </>,
      )}

      {authorizeHelper.canRenderWithRole(
        [Role.ACCOUNTANT, Role.ADMIN],
        <Row
          gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}
          style={{ marginTop: 10 }}
        >
          <Col span={24}>
            <Title level={4} type="secondary">
              Lợi Nhuận
            </Title>
            <Descriptions size="small" bordered column={1} layout="vertical">
              <Descriptions.Item label="Lợi nhuận thô sau/trước thuế">
                <Space>
                  <Text>
                    {toCurrency(
                      (bill.salePrice || 0) -
                        (bill.purchasePriceAfterVatInVnd || 0),
                    )}
                  </Text>
                  <Text>/</Text>
                  <Text>
                    {toCurrency(
                      (bill.salePrice || 0) - (bill.purchasePriceInVnd || 0),
                    )}
                  </Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Lợi nhuận thực tạm tính (KH thanh toán - Thanh toán NCC)">
                {toCurrency(
                  (bill.customerPaymentAmount || 0) +
                    (bill.otherCustomerPaymentAmount || 0) -
                    (bill.vendorPaymentAmount || 0),
                )}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>,
      )}

      <Modal
        visible={isSubmitting}
        mask={false}
        maskClosable={false}
        keyboard={false}
        footer={false}
        closable={false}
        bodyStyle={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        centered
        width={150}
      >
        <Spin />
        <Text strong>Đang xử lý...</Text>
      </Modal>
    </>
  );
};

export default memo(BillView);
