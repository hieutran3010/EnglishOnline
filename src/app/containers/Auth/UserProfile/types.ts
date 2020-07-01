/* --- STATE --- */
export interface UserProfileState {
  isChangingPass: boolean;
  passChangingError: string;
}

export type ContainerState = UserProfileState;
