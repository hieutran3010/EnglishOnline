import { Tooltip, Input, Button, Tag, Typography, Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import React, { CSSProperties, memo, ReactElement } from 'react';
import BillsInMonthSelection from '../components/BillsInMonthSelection';
import {
  StyledBillsFilterContainer,
  StyledMyBillsStatisticContainer,
} from './styles/StyledIndex';
import CreatedMyBillsToday from '../components/CreatedMyBillsToday';
import { InfiniteLoadingList } from 'app/components/collection/List';
import Bill from 'app/models/bill';
import { Role } from 'app/models/user';

const { Search } = Input;
const { Text } = Typography;

interface Props {
  selectedMonth: number;
  onMonthChanged: (month: number) => void;
  totalSelfCreatedBillsToday: number;
  onCountTotalMyBillsCreatedToday: () => void;
  onSearchMyBills: (searchKey: string) => void;
  onReloadMyBills: () => void;
  onFetchMoreMyBills: () => void;
  isLoadingMyBills: boolean;
  totalMyBills: number;
  myBills: Bill[];
  renderMyBillBlock: (item: Bill & any) => ReactElement;
  style?: CSSProperties;
  role?: Role;
}
const MyBills = ({
  selectedMonth,
  onMonthChanged,
  totalSelfCreatedBillsToday,
  onCountTotalMyBillsCreatedToday,
  onSearchMyBills,
  onReloadMyBills,
  onFetchMoreMyBills,
  isLoadingMyBills,
  totalMyBills,
  myBills,
  renderMyBillBlock,
  style,
  role,
}: Props) => {
  return (
    <div
      style={{
        height: '100%',
        overflow: 'auto',
        ...style,
      }}
    >
      <StyledBillsFilterContainer>
        <BillsInMonthSelection
          selectedMonth={selectedMonth}
          onMonthChanged={onMonthChanged}
        />
        <Tooltip title="Tìm theo Bill hãng bay, bill con, tên/sđt người gởi, tên người nhận">
          <Search
            size="small"
            enterButton
            style={{ flex: 0.9 }}
            onSearch={onSearchMyBills}
            allowClear
          />
        </Tooltip>
        <Tooltip title="Tải lại dữ liệu">
          <Button
            type="primary"
            shape="circle"
            icon={<ReloadOutlined />}
            size="small"
            onClick={onReloadMyBills}
          />
        </Tooltip>
      </StyledBillsFilterContainer>
      <StyledMyBillsStatisticContainer>
        {role !== Role.SALE && (
          <CreatedMyBillsToday
            numberOfBills={totalSelfCreatedBillsToday}
            onCountTotalMyBillsCreatedToday={onCountTotalMyBillsCreatedToday}
          />
        )}
        <Space size="small">
          <Tag color="green" style={{ margin: 0 }}>
            {totalMyBills}
          </Tag>
          <Text> bills</Text>
        </Space>
      </StyledMyBillsStatisticContainer>
      <InfiniteLoadingList
        onRenderItem={renderMyBillBlock}
        loading={isLoadingMyBills}
        totalItems={totalMyBills}
        onLoadData={onFetchMoreMyBills}
        data={myBills}
      />
    </div>
  );
};

export default memo(MyBills);
