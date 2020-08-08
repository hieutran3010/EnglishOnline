import React, {
  memo,
  useCallback,
  useMemo,
  useState,
  ReactElement,
} from 'react';
import { Tooltip, Input, List } from 'antd';
import trim from 'lodash/fp/trim';
import Bill from 'app/models/bill';
import toLower from 'lodash/fp/toLower';
import isEmpty from 'lodash/fp/isEmpty';
import filter from 'lodash/fp/filter';
import toString from 'lodash/fp/toString';

interface Props {
  bills: Bill[];
  isFetching?: boolean;
  renderBillBlock: (bill: Bill) => ReactElement;
}
const WorkingBills = ({ bills, isFetching, renderBillBlock }: Props) => {
  const [myBillsFilterKey, setMyBillsFilterKey] = useState('');

  const onSearchMyBills = useCallback(value => {
    setMyBillsFilterKey(trim(value));
  }, []);

  const filteredMyBills = useMemo(() => {
    if (!isEmpty(myBillsFilterKey)) {
      const lowerFilter = toLower(myBillsFilterKey);
      return filter(
        (b: Bill) =>
          toString(b.airlineBillId).includes(lowerFilter) ||
          toString(b.childBillId).includes(lowerFilter) ||
          toLower(b.senderName).includes(lowerFilter) ||
          toLower(b.senderPhone).includes(lowerFilter),
      )(bills);
    }

    return bills;
  }, [bills, myBillsFilterKey]);

  return (
    <>
      <Tooltip title="Nhập bill hãng bay hoặc bill con hoặc số điện thoại/tên khách gởi sau đó nhấn Enter để tìm">
        <Input.Search
          style={{ marginBottom: 5, marginTop: 2 }}
          placeholder="Tìm bill"
          onSearch={onSearchMyBills}
          enterButton
          size="small"
          allowClear
        />
      </Tooltip>
      <List
        renderItem={renderBillBlock}
        loading={isFetching}
        dataSource={filteredMyBills}
      />
    </>
  );
};

export default memo(WorkingBills);
