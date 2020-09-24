import React, { memo, useEffect } from 'react';
import { Tag, Button } from 'antd';

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

  return numberOfBills > 0 ? (
    <Button size="small" style={{ margin: 0, padding: 0, border: 0 }}>
      <Tag
        color="rgb(205, 32, 31)"
        style={{ borderRadius: 10, marginRight: 5 }}
      >
        {numberOfBills} VAT bills
      </Tag>
    </Button>
  ) : (
    <></>
  );
};

export default memo(VatPrintedChecking);
