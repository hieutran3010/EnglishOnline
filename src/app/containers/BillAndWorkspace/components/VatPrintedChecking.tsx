import React, { memo, useEffect } from 'react';
import { Typography, Divider } from 'antd';

const { Text } = Typography;

interface Props {
  numberOfBills: number;
  onCheckNumberOfVatBill?: () => void;
}
const VatPrintedChecking = ({
  numberOfBills,
  onCheckNumberOfVatBill,
}: Props) => {
  useEffect(() => {
    let counter;
    if (onCheckNumberOfVatBill) {
      counter = setInterval(() => {
        onCheckNumberOfVatBill();
      }, 60000);
    }

    return function cleanUp() {
      if (counter) {
        clearInterval(counter);
      }
    };
  }, [onCheckNumberOfVatBill]);

  return (
    <>
      {numberOfBills > 0 && (
        <>
          <Divider type="vertical" />
          <Text type="warning">
            Có {numberOfBills} bill cần đánh dấu xuất VAT
          </Text>
        </>
      )}
    </>
  );
};

export default memo(VatPrintedChecking);
