import React, { memo, useEffect } from 'react';

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
      }, 180000);
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
          <span>Có {numberOfBills} bill cần đánh dấu xuất VAT.</span>
        </>
      )}
    </>
  );
};

export default memo(VatPrintedChecking);
