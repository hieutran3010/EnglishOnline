import styled from 'styled-components/macro';
import { Role } from 'app/models/user';
import { getMarginLeft } from 'app/components/Layout/AppLayout';

export const StyledMainToolbar = styled.div`
  position: absolute;
  z-index: 1;
  background-color: white;
  width: 100%;
  padding: 10px;
  border-radius: 5px;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 3px 0px,
    rgba(0, 0, 0, 0.06) 0px 1px 2px 0px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

export const StyledContainer = styled.div`
  display: flex;
  position: fixed;
  right: 20px;
  left: ${(props: any) =>
    `${getMarginLeft(props.screenMode, props.collapsedMenu)}px`};
  bottom: 0;
  top: ${(props: any) => (props.role === Role.SALE ? '74px' : '128px')};
`;

export const StyledLeftContainer = styled.div`
  width: 250px;
  margin-right: 20px;

  display: flex;
  flex-direction: column;
  margin-top: 7px;
`;

export const StyledRightContainer = styled.div`
  flex: 1;
  overflow: auto;
  margin-bottom: 10px;
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
