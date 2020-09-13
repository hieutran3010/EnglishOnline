/**
 *
 * QuickQuotation
 *
 */

import React, { memo } from 'react';
import { Tabs } from 'antd';

import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';
import { authStorage } from 'app/services/auth';
import { Role } from 'app/models/user';
import { ContentContainer } from 'app/components/Layout';

import { reducer, sliceKey } from './slice';
import { quickQuotationSaga } from './saga';
import SaleRateSetting from './SaleRateSetting';
import SaleQuotation from './SaleQuotation';

const { TabPane } = Tabs;

export const QuickQuotation = memo(() => {
  useInjectReducer({ key: sliceKey, reducer: reducer });
  useInjectSaga({ key: sliceKey, saga: quickQuotationSaga });

  const role = authStorage.getRole();

  if (role === Role.ADMIN) {
    return (
      <Tabs defaultActiveKey="1" size="small">
        <TabPane tab="Báo Giá" key="1">
          <SaleQuotation />
        </TabPane>
        <TabPane tab="Thiết lập % tăng" key="2">
          <ContentContainer>
            <SaleRateSetting />
          </ContentContainer>
        </TabPane>
      </Tabs>
    );
  }

  if (role === Role.SALE) {
    return <SaleQuotation />;
  }

  return <></>;
});
