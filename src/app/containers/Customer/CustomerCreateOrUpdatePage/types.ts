import type Customer from 'app/models/customer';
import User from 'app/models/user';

/* --- STATE --- */
export interface CustomerCreateOrUpdatePageState {
  isSubmitting: boolean;
  isFetchingCustomer: boolean;
  customer: Customer;
  isFetchingSaleUsers: boolean;
  saleUsers: User[];
}

export interface CustomerSubmitActionType {
  history: any;
  customer: Customer;
}

export type ContainerState = CustomerCreateOrUpdatePageState;
