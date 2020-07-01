import User from 'app/models/user';

/* --- STATE --- */
export interface UserCreateOrUpdatePageState {
  isSubmitting: boolean;
  error: string;

  isFetchingUser: boolean;
  user: User;
}

export type ContainerState = UserCreateOrUpdatePageState;
