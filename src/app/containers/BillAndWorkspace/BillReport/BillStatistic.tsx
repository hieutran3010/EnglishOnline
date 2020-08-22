import React, { memo } from 'react';
import { Card, Statistic, Spin, Space } from 'antd';
import { MoneyCollectOutlined, FieldNumberOutlined } from '@ant-design/icons';
import { toCurrency } from 'utils/numberFormat';
import { authStorage } from 'app/services/auth';
import { Role } from 'app/models/user';
import { StatisticProps } from 'antd/lib/statistic/Statistic';

export interface BillStatisticProps {
  isFetchingTotalSalePrice: boolean;
  totalSalePrice: number;
  isFetchingTotalRevenue: boolean;
  totalRevenue: number;
  isFetchingTotalCustomerDebt: boolean;
  totalCustomerDebt: number;
  isFetchingTotalVendorDebt: boolean;
  totalVendorDebt: number;
  isFetchingTotalProfit: boolean;
  totalProfitBeforeTax: number;
  totalProfit: number;
  isFetchingTotalRawProfit: boolean;
  totalRawProfitBeforeTax: number;
  totalRawProfit: number;
  totalBillCount: number;
  isFetchingTotalBillCount: boolean;
}

interface StatisticBlock {
  isFetching?: boolean;
  value: number | any;
  title: string;
}

const StatisticBlock = memo((props: StatisticBlock & StatisticProps) => {
  const statisticProps = props as StatisticProps;
  return (
    <Card>
      <Statistic
        title={
          <>
            {props.title} {props.isFetching && <Spin size="small" />}
          </>
        }
        value={toCurrency(props.value)}
        precision={0}
        valueStyle={{ color: '#3f8600' }}
        prefix={<MoneyCollectOutlined />}
        {...statisticProps}
      />
    </Card>
  );
});

const BillStatistic = (props: BillStatisticProps) => {
  const user = authStorage.getUser();
  switch (user.role) {
    case Role.SALE: {
      return (
        <Space>
          <StatisticBlock
            title="Tổng số Bill"
            isFetching={props.isFetchingTotalBillCount}
            value={props.totalBillCount}
            prefix={<FieldNumberOutlined />}
          />
          <StatisticBlock
            title="Tổng giá bán"
            value={props.totalSalePrice}
            isFetching={props.isFetchingTotalSalePrice}
          />
        </Space>
      );
    }
    case Role.ADMIN: {
      return (
        <Space>
          <StatisticBlock
            title="Tổng số Bill"
            isFetching={props.isFetchingTotalBillCount}
            value={props.totalBillCount}
            prefix={<FieldNumberOutlined />}
          />
          <StatisticBlock
            title="Tổng doanh thu"
            value={props.totalRevenue}
            isFetching={props.isFetchingTotalRevenue}
          />
          <StatisticBlock
            title="Tổng nợ của Khách"
            value={props.totalCustomerDebt}
            isFetching={props.isFetchingTotalCustomerDebt}
            valueStyle={
              props.totalCustomerDebt > 0
                ? { color: '#cf1322' }
                : { color: '#3f8600' }
            }
          />
          <StatisticBlock
            title="Tổng nợ Nhà cung cấp"
            value={props.totalVendorDebt}
            isFetching={props.isFetchingTotalVendorDebt}
            valueStyle={
              props.totalVendorDebt > 0
                ? { color: '#cf1322' }
                : { color: '#3f8600' }
            }
          />
          <StatisticBlock
            title="Lợi nhuận thô sau thuế /trước thuế "
            value={props.totalRawProfit}
            isFetching={props.isFetchingTotalRawProfit}
            suffix={`/ ${toCurrency(props.totalRawProfitBeforeTax)}`}
          />
          <StatisticBlock
            title="Lợi nhuận sau thuế /trước thuế theo dữ liệu nhập"
            value={props.totalProfit}
            isFetching={props.isFetchingTotalProfit}
            suffix={`/ ${toCurrency(props.totalProfitBeforeTax)}`}
          />
        </Space>
      );
    }
    case Role.ACCOUNTANT: {
      return (
        <Space>
          <StatisticBlock
            title="Tổng số Bill"
            isFetching={props.isFetchingTotalBillCount}
            value={props.totalBillCount}
            prefix={<FieldNumberOutlined />}
          />
          <StatisticBlock
            title="Tổng nợ của Khách"
            value={props.totalCustomerDebt}
            isFetching={props.isFetchingTotalCustomerDebt}
            valueStyle={
              props.totalCustomerDebt > 0
                ? { color: '#cf1322' }
                : { color: '#3f8600' }
            }
          />
          <StatisticBlock
            title="Tổng nợ Nhà cung cấp"
            value={props.totalVendorDebt}
            isFetching={props.isFetchingTotalVendorDebt}
            valueStyle={
              props.totalVendorDebt > 0
                ? { color: '#cf1322' }
                : { color: '#3f8600' }
            }
          />
        </Space>
      );
    }
    default:
      return (
        <Space>
          <StatisticBlock
            title="Tổng số Bill"
            isFetching={props.isFetchingTotalBillCount}
            value={props.totalBillCount}
            prefix={<FieldNumberOutlined />}
          />
        </Space>
      );
  }
};

export default memo(BillStatistic);
