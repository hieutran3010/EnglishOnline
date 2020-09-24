import styled from 'styled-components/macro';

export const StyledBillBlock = styled.div`
  padding: 7px;
  background-color: white;
  border-radius: ${(props: any) => (props.bordered ? '0' : '10px')};
  margin-bottom: 0.5rem;
  display: inline-flex;
  width: 100%;
  border-bottom: ${(props: any) => (props.bordered ? '1px solid #f0f2f5' : '')};
`;

export const StyledLeftBillBlock = styled.div`
  border-radius: 5px;
  padding: 5px;
  background-color: ${(props: any) => props.backgroundColor ?? '#00a651'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-right: 5px;
  width: 30px;

  span {
    font-weight: 600;
    color: ${(props: any) => props.color ?? 'white'};
  }
`;

export const StyledRightBillBlock = styled.div`
  flex: 1 1 0%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
`;
