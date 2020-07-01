import styled from 'styled-components/macro';

export const LoadingContainer = styled.div`
  position: absolute;
  bottom: 40px;
  width: 100%;
  text-align: center;
`;

export const WrappedListStyle = styled.div`
  .ant-list-vertical .ant-list-item-action {
    margin-top: 10px;
  }

  .ant-list-item {
    padding: 5px;
  }

  .ant-list-item:hover {
    background-color: #e6f7ff;
    transition: 0.3s;
    cursor: pointer;
  }
`;
