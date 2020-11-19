import ModelBase from './modelBase';

export default class User extends ModelBase {
  email!: string;
  emailVerified!: boolean;
  phoneNumber?: string;
  password?: string;
  displayName!: string;
  avatarUrl?: string;
  role?: string;
  disabled?: boolean;
  roles: string[];

  /**
   *
   */
  constructor() {
    super();
    this.roles = [];
  }
}
