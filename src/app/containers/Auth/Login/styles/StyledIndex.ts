import styled from 'styled-components/macro';

export const StyledLogInContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: rgb(217, 217, 217, 0.3);
  justify-content: center;
  align-items: center;

  img {
    margin-bottom: 24px;
    margin-left: auto;
    margin-right: auto;
  }
`;

export const StyledLoginFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  width: 400px;

  .ant-form-item .ant-btn {
    width: 100%;
  }
`;
