import React, { memo, useMemo, useEffect, useCallback, useState } from 'react';
import { Space, Spin, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import getDataSource, { FETCHER_KEY } from 'app/collection-datasource';
import User, { Role } from 'app/models/user';
import Bill, { BILL_STATUS } from 'app/models/bill';
import { List } from 'app/components/collection/List';
import { authStorage } from 'app/services/auth';
import BillBlock from '../components/BillBlock';
import { StyledGroupHeader } from './styles/StyledIndex';

const getUnassignedBillsQuery = (user: User) => {
  switch (user.role) {
    case Role.LICENSE: {
      return `LicenseUserId = null and Status = "${BILL_STATUS.LICENSE}"`;
    }
    case Role.ACCOUNTANT: {
      return `AccountantUserId = null and Status = "${BILL_STATUS.ACCOUNTANT}"`;
    }
    case Role.ADMIN: {
      return `LicenseUserId = null && AccountantUserId = null`;
    }
    default: {
      return `Id = null`;
    }
  }
};

interface UnassignedBillsProps {
  onBillSelectionChanged: (bill: Bill) => void;
}
const UnassignedBills = ({ onBillSelectionChanged }: UnassignedBillsProps) => {
  const user = authStorage.getUser();
  const billDataSource = useMemo(() => {
    const billDataSource = getDataSource(FETCHER_KEY.BILL);
    billDataSource.orderByFields = 'date descending';
    billDataSource.query = getUnassignedBillsQuery(user);

    return billDataSource;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const [isFetching, setIsFetching] = useState(false);

  const renderBillBlock = (bill: any) => {
    return <BillBlock bill={bill} onEdit={onBillSelectionChanged} />;
  };

  useEffect(() => {
    const counter = setInterval(() => {
      billDataSource.onReloadData();
    }, 10000);

    return function cleanUp() {
      clearInterval(counter);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onStartFetchingData = useCallback(() => {
    setIsFetching(true);
  }, []);
  const onFinishFetchingData = useCallback(() => {
    setIsFetching(false);
  }, []);

  return (
    <>
      <Space align="center">
        <StyledGroupHeader>Bill chờ xử lý</StyledGroupHeader>
        <Tooltip title="Tự động tải lại sau mỗi 10s">
          <InfoCircleOutlined style={{ marginBottom: 5 }} />
        </Tooltip>
        {isFetching && <Spin size="small" />}
      </Space>
      <List
        graphQLDataSource={billDataSource}
        displayPath="airlineBillId"
        renderItem={renderBillBlock}
        bordered={false}
        rowKey={item => item.id}
        onStartFetchingData={onStartFetchingData}
        onFinishFetchingData={onFinishFetchingData}
        manualShowLoading={true}
      />
    </>
  );
};

export default memo(UnassignedBills);
