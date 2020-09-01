import React, { memo, useMemo, ReactElement, useEffect } from 'react';
import Bill, { BILL_STATUS } from 'app/models/bill';
import { List } from 'app/components/collection/List';
import getDataSource, { FETCHER_KEY } from 'app/collection-datasource';
import User, { Role } from 'app/models/user';
import { authStorage } from 'app/services/auth';

function getMyBillsQuery(user: User) {
  switch (user.role) {
    case Role.LICENSE: {
      return `Status != "${BILL_STATUS.DONE}" and LicenseUserId = "${user.id}"`;
    }
    case Role.ACCOUNTANT: {
      return `Status != "${BILL_STATUS.DONE}" and AccountantUserId = "${user.id}"`;
    }
    case Role.ADMIN: {
      return `Status != "${BILL_STATUS.DONE}" and (AccountantUserId = "${user.id}" || LicenseUserId = "${user.id}" || SaleUserId = "${user.id}")`;
    }
    case Role.SALE: {
      return `Status != "${BILL_STATUS.DONE}" and SaleUserId = "${user.id}"`;
    }
    default: {
      return ``;
    }
  }
}

const getUnassignedBillsQuery = (user: User) => {
  switch (user.role) {
    case Role.LICENSE: {
      return `LicenseUserId = null and Status = "${BILL_STATUS.LICENSE}"`;
    }
    case Role.ACCOUNTANT: {
      return `AccountantUserId = null and Status = "${BILL_STATUS.ACCOUNTANT}"`;
    }
    case Role.ADMIN: {
      return `(LicenseUserId = null || AccountantUserId = null) and Status != "${BILL_STATUS.DONE}"`;
    }
    default: {
      return `Id = null`;
    }
  }
};

interface Props {
  renderBillBlock: (bill: Bill) => ReactElement;
  needToReload?: boolean;
  onReloaded?: () => void;
  onGetQuery?: (user: User) => string;
}
const WorkingBills = ({
  renderBillBlock,
  needToReload,
  onReloaded,
  onGetQuery,
}: Props) => {
  const user = authStorage.getUser();

  const billDataSource = useMemo(() => {
    const dataSource = getDataSource(FETCHER_KEY.BILL, [
      'billDeliveryHistories {date time status}',
    ]);
    dataSource.orderByFields = 'date desc';
    dataSource.query = onGetQuery ? onGetQuery(user) : '';

    return dataSource;
  }, [user, onGetQuery]);

  useEffect(() => {
    if (needToReload === true) {
      billDataSource.onReloadData();
      if (onReloaded) onReloaded();
    }
  }, [billDataSource, needToReload, onReloaded]);

  return (
    <List
      renderItem={renderBillBlock}
      graphQLDataSource={billDataSource}
      searchPlaceholder="Tìm bill"
      searchHint="Nhập bill hãng bay hoặc bill con hoặc số điện thoại/tên khách gởi sau đó nhấn Enter để tìm"
      searchFields={[
        'airlineBillId',
        'childBillId',
        'senderName',
        'senderPhone',
      ]}
    />
  );
};

export const MyBills = memo((props: Props) => {
  return <WorkingBills {...props} onGetQuery={getMyBillsQuery} />;
});

export const UnassignedBills = memo((props: Props) => {
  return <WorkingBills {...props} onGetQuery={getUnassignedBillsQuery} />;
});

export default memo(WorkingBills);
