import React, { CSSProperties, memo, useCallback } from 'react';
import { Radio } from 'antd';
import { BillListType } from '../types';

interface Props {
  onBillListTypeChanged: (billListType: BillListType) => void;
  billListType: BillListType;
  style?: CSSProperties;
}
const AdminTools = memo(
  ({ onBillListTypeChanged, billListType, style }: Props) => {
    const _onBillListTypeChanged = useCallback(
      e => {
        onBillListTypeChanged(e.target.value);
      },
      [onBillListTypeChanged],
    );

    return (
      <Radio.Group
        style={style}
        onChange={_onBillListTypeChanged}
        options={[
          { label: 'Danh sách Bill', value: BillListType.Normal },
          {
            label: 'Nhóm theo Nhà cung cấp',
            value: BillListType.GroupByVendor,
          },
          {
            label: 'Nhóm theo Khách Gởi',
            value: BillListType.GroupByCustomer,
          },
          {
            label: 'Nhóm theo Sales',
            value: BillListType.GroupBySales,
          },
        ]}
        optionType="button"
        buttonStyle="solid"
        value={billListType}
      />
    );
  },
);

export default AdminTools;
