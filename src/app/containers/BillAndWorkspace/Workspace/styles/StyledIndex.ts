import styled from 'styled-components/macro';

export const StyledContainer = styled.div`
  display: flex;
`;

export const StyledLeftContainer = styled.div`
  width: 250px;
  margin-right: 10px;

  display: flex;
  flex-direction: column;
`;

export const StyledRightContainer = styled.div`
  width: 100px;
  flex: 1;
`;

export const StyledDateAndAssigneeContainer = styled.div`
  display: flex;
  justify-content: space-between;

  .ant-row:first {
    width: 160px;
  }
`;

export const StyledCustomerContainer = styled.div`
  display: flex;
`;

export const StyledSenderContainer = styled.div`
  flex: 0.5;
`;

export const StyledReceiverContainer = styled.div`
  flex: 0.5;
`;

export const StyledEmpContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
`;

export const StyledEmpItemContainer = styled.div`
  flex: 0.3;
`;

export const StyledEmpCenterItemContainer = styled.div`
  flex: 0.4;
`;

export const StyledCustomerSelectionContainer = styled.div`
  display: flex;
  align-items: baseline;
  .ant-select {
    margin-left: 6px;
    min-width: 200px;
  }
`;

export const StyledFeeContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  background-color: rgb(217, 217, 217, 0.3) !important;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 5px;
`;

export const StyledFeeItemContainer = styled.div`
  flex: 0.25;
  .ant-form-item {
    margin-bottom: 0;
  }
`;

export const StyledGroupHeader = styled.span`
  font-weight: 600;
  font-size: 10px;
  opacity: 0.5;
  text-transform: uppercase;
`;
