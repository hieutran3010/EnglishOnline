import { Role } from 'app/models/user';
import { BILL_STATUS } from 'app/models/bill';

export const BILL_STATUS_ROLE_EDITABLE_MATRIX = {
  [Role.SALE]: {
    [BILL_STATUS.LICENSE]: false,
    [BILL_STATUS.ACCOUNTANT]: false,
    [BILL_STATUS.DONE]: false,
  },
  [Role.ADMIN]: {
    [BILL_STATUS.LICENSE]: true,
    [BILL_STATUS.ACCOUNTANT]: true,
    [BILL_STATUS.DONE]: false,
  },
  [Role.LICENSE]: {
    [BILL_STATUS.LICENSE]: true,
    [BILL_STATUS.ACCOUNTANT]: false,
    [BILL_STATUS.DONE]: false,
  },
  [Role.ACCOUNTANT]: {
    [BILL_STATUS.LICENSE]: false,
    [BILL_STATUS.ACCOUNTANT]: true,
    [BILL_STATUS.DONE]: false,
  },
};
