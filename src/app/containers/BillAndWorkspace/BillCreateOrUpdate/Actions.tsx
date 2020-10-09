import { Button, Typography, Space } from 'antd';
import { BILL_STATUS } from 'app/models/bill';
import { Role } from 'app/models/user';
import { authorizeHelper } from 'app/services/auth';
import isEmpty from 'lodash/fp/isEmpty';
import React, { CSSProperties, memo } from 'react';
import { isMobile } from 'react-device-detect';

const { Text } = Typography;

interface Props {
  style: CSSProperties;
  isSubmitting?: boolean;
  isAssigningAccountant?: boolean;
  isCalculatingPurchasePrice?: boolean;
  isDeletingBill?: boolean;
  isFinalBill?: boolean;
  isAssigningLicense?: boolean;
  billId?: string;
  billStatus?: BILL_STATUS;
  onAssignToAccountant?: () => Promise<void>;
  onAssignToLicense?: () => Promise<void>;
  onFinalBill?: () => Promise<void>;
  onDeleteBill?: () => void;
  canDelete?: boolean;
  isDirty?: boolean;
}
const Actions = ({
  style,
  isSubmitting,
  isAssigningAccountant,
  isCalculatingPurchasePrice,
  isDeletingBill,
  isFinalBill,
  isAssigningLicense,
  billId,
  billStatus,
  onAssignToAccountant,
  onAssignToLicense,
  onFinalBill,
  onDeleteBill,
  canDelete,
  isDirty,
}: Props) => {
  const buttonSize = isMobile === true ? 'small' : 'middle';

  return (
    <div style={{ ...style, flexDirection: 'column' }}>
      {isDirty && (
        <Text type="warning" strong>
          Có thay đổi dữ liệu, bấm Lưu để tránh mất dữ liệu!
        </Text>
      )}
      <Space>
        <Button
          size={buttonSize}
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
            size={buttonSize}
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
            Chuyển Kế Toán
          </Button>
        )}

        {!isEmpty(billId) &&
          billStatus === BILL_STATUS.ACCOUNTANT &&
          authorizeHelper.canRenderWithRole(
            [Role.ACCOUNTANT, Role.ADMIN],
            <>
              <Button
                size={buttonSize}
                type="primary"
                ghost
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
                Chuyển Chứng Từ
              </Button>
              <Button
                size={buttonSize}
                type="primary"
                ghost
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

        {canDelete && !isEmpty(billId) && billStatus !== BILL_STATUS.DONE && (
          <Button
            size={buttonSize}
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
    </div>
  );
};

export default memo(Actions);
