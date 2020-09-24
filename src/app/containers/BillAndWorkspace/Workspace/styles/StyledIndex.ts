import styled from 'styled-components/macro';

export const StyledMainToolbar = styled.div`
  position: -webkit-sticky; /* Safari */
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: white;
  padding: 10px;
  border-radius: 5px;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 3px 0px,
    rgba(0, 0, 0, 0.06) 0px 1px 2px 0px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  right: 0;
  left: 0;
  margin-bottom: 10px;
`;

export const StyledContainer = styled.div`
  display: flex;
  height: 100%;
`;

export const StyledRightContainer = styled.div`
  flex: 1 1 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
`;

export const StyledBillsFilterContainer = styled.div`
  background-color: white;
  padding: 10px;
  border-radius: 5px;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 3px 0px,
    rgba(0, 0, 0, 0.06) 0px 1px 2px 0px;
  margin-bottom: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
`;

export const StyledMyBillsStatisticContainer = styled(
  StyledBillsFilterContainer,
)`
  width: 100%;
  span {
    font-size: 0.8rem;
  }
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
  background-color: rgb(217, 217, 217, 0.3) !important;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 5px;
`;

export const StyledGroupHeader = styled.span`
  font-weight: 600;
  font-size: 10px;
  opacity: 0.5;
  text-transform: uppercase;
`;
