import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  html,
  body {
    height: 100%;
    width: 100%;
  }
  .ant-btn .anticon svg {
    margin-bottom: 6px
  }

  .ant-btn-link .anticon svg {
    margin-bottom: 3px!important;
  }

  .ant-avatar .anticon svg {
    margin-bottom: 6px
  }

  .ant-picker-input svg {
    margin-bottom: 5px;
  }

  .data-grid-container .data-grid .cell {
    vertical-align: middle;
    padding: 0px 5px;
    }
  
  .data-grid-container table {
    width: 100%
  }

  .data-grid-container .data-grid .cell > input {
    height: 20px;
  }

  .ant-select-selection-item-remove svg {
    margin-bottom: 5px;
  }

  .ant-select-item-option-state svg {
    margin-bottom: 5px;
  }

  .ant-menu-item svg {
    margin-bottom: 7px;
  }

  .ant-select-auto-complete svg {
    margin-bottom: 7px; 
  }

  .ant-picker-suffix svg {
    margin-bottom: 5px;
  }

  .ant-picker-separator svg {
    margin-bottom: 5px;
  }

  .ant-radio-button-wrapper svg {
    margin-bottom: 5px;
  }

  .ant-menu-submenu svg {
    margin-bottom: 7px;
  }

  .ant-statistic-content-prefix svg {
    margin-bottom: 6px;
  }

  .ant-pagination-item-link svg {
    margin-bottom: 5px;
  }

  .ant-table-tbody > tr .ant-table-wrapper:only-child .ant-table td {
    background-color: white;
  }

  .content-container {
    .ant-card-actions {
      position: sticky;
      position: -webkit-sticky;
      bottom: 0;
    }
    .ant-card-head {
      position: sticky;
      top: 0;
      background-color: white;
      z-index: 1;
    }
  }
`;
