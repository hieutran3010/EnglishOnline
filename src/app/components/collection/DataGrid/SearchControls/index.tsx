/* eslint-disable no-param-reassign */
/* eslint-disable react/prop-types */
import React from 'react';
import { Input, Space, Button } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';

const getColumnSearchProps = (dataIndex: string, searchInput?: any) => ({
  filterDropdown: ({
    setSelectedKeys,
    selectedKeys,
    confirm,
    clearFilters,
  }) => (
    <Space style={{ margin: 10 }}>
      <Input
        ref={node => {
          searchInput = node;
        }}
        placeholder={`Search ${dataIndex}`}
        value={selectedKeys[0]}
        onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
        onPressEnter={() => confirm()}
        allowClear
        style={{ width: 188 }}
      />
      <Button onClick={() => clearFilters()}>
        <ClearOutlined />
      </Button>
    </Space>
  ),
  filterIcon: filtered => (
    <SearchOutlined style={{ color: filtered ? '#00a651' : undefined }} />
  ),
  onFilterDropdownVisibleChange: visible => {
    if (visible) {
      setTimeout(() => searchInput?.select());
    }
  },
});

const getLocalColumnSearchProps = (dataIndex: string, searchInput?: any) => ({
  filterDropdown: ({
    setSelectedKeys,
    selectedKeys,
    confirm,
    clearFilters,
  }) => (
    <Space style={{ margin: 10 }}>
      <Input
        ref={node => {
          searchInput = node;
        }}
        placeholder={`Search ${dataIndex}`}
        value={selectedKeys[0]}
        onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
        onPressEnter={() => confirm()}
        allowClear
        style={{ width: 188 }}
      />
      <Button onClick={() => clearFilters()}>
        <ClearOutlined />
      </Button>
    </Space>
  ),
  filterIcon: filtered => (
    <SearchOutlined style={{ color: filtered ? '#00a651' : undefined }} />
  ),
  onFilter: (value, record) =>
    record[dataIndex] &&
    record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
  onFilterDropdownVisibleChange: visible => {
    if (visible) {
      setTimeout(() => searchInput?.select());
    }
  },
});

export { getColumnSearchProps, getLocalColumnSearchProps };
