/* --- STATE --- */
export interface LoginState {
  error: string;
  isBeingLogin: boolean;
  isRecovering: boolean;
  recoveryError: string;
}

export interface LoginAction {
  email: string;
  password: string;
}

export type ContainerState = LoginState;
