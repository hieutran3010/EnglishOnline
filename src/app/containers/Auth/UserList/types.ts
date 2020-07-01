import User from 'app/models/user';

/* --- STATE --- */
export interface UserListState {
  isFetchingUsers: boolean;
  users: User[];
}

export type ContainerState = UserListState;
