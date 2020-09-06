import type Customer from 'app/models/customer';

/* --- STATE --- */
export interface CustomerCreateOrUpdatePageState {
  isSubmitting: boolean;
  isFetchingCustomer: boolean;
  customer: Customer;
}

export interface CustomerSubmitActionType {
  history: any;
  customer: Customer;
}

export type ContainerState = CustomerCreateOrUpdatePageState;
