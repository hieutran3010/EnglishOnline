import { Subject } from 'rxjs';
import isEmpty from 'lodash/fp/isEmpty';
import toString from 'lodash/fp/toString';
import firebase from 'firebase/app';

import User from 'app/models/user';
import { authStorage } from '.';
import UserFetcher from 'app/fetchers/userFetcher';

export const IS_AUTHENTICATED = 'IS_AUTHENTICATED';

export class AuthService {
  onLoginSuccess = new Subject();
  onLogoutSuccess = new Subject();

  constructor() {
    firebase.auth().onAuthStateChanged(this.onLoginChanged);
  }

  onLoginChanged = user => {
    if (user) {
      if (user.emailVerified === true) {
        localStorage.removeItem(IS_AUTHENTICATED);
        localStorage.setItem(IS_AUTHENTICATED, 'perfect');
      }
      this._getCurrentUser().then((user: User) => {
        authStorage.storeUser(user);
        this.onLoginSuccess.next(user);
      });
    } else {
      localStorage.removeItem(IS_AUTHENTICATED);
      authStorage.clear();
      this.onLogoutSuccess.next();
    }
  };

  isAuthenticated = (): boolean => {
    return !isEmpty(localStorage.getItem(IS_AUTHENTICATED));
  };

  private _getCurrentUser = async (): Promise<User> => {
    const firebaseUser = firebase.auth().currentUser;

    const user = new User();
    if (firebaseUser) {
      user.id = firebaseUser.uid;
      user.email = toString(firebaseUser.email);
      user.emailVerified = firebaseUser.emailVerified;
      user.displayName = toString(firebaseUser.displayName);
      user.avatarUrl = toString(firebaseUser.photoURL);
      user.phoneNumber = toString(firebaseUser.phoneNumber);

      const tokenResult = await firebaseUser.getIdTokenResult();
      user.role = tokenResult.claims['roles'];
    }

    return user;
  };

  // TODO: should log event for exception here
  login = (email: string, password: string) => {
    return firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .catch(error => {
        const { code } = error;
        switch (code) {
          case 'auth/invalid-email': {
            throw new Error('Email không đúng');
          }
          case 'auth/user-disabled': {
            throw new Error('Tài khoản của bạn hiện đang bị khoá');
          }
          case 'auth/user-not-found': {
            throw new Error('Tài khoản này không tồn tại');
          }
          case 'auth/wrong-password': {
            throw new Error('Sai mật khẩu hoặc email');
          }
          default: {
            throw new Error('Đăng nhập không thành công, vui lòng thử lại!');
          }
        }
      });
  };

  logout = () => {
    return firebase
      .auth()
      .signOut()
      .catch(() => {
        this.onLogoutSuccess.next();
      });
  };

  getIdTokenAsync = async () => {
    const currentUser = firebase.auth().currentUser;
    if (currentUser) {
      const tokenResult = await currentUser.getIdTokenResult();
      return tokenResult.token;
    }

    return '';
  };

  sendEmailVerification = () => {
    return firebase.auth().currentUser?.sendEmailVerification();
  };

  getUserById = (uid?: string): Promise<User> | undefined => {
    if (!uid) {
      return undefined;
    }

    const userFetcher = new UserFetcher();

    return userFetcher.get(uid);
  };

  recovery(email) {
    // TODO: change here
    const actionCodeSettings = {
      url: process.env.PUBLIC_URL,
    };

    return firebase
      .auth()
      .sendPasswordResetEmail(email, actionCodeSettings)
      .catch(error => {
        const { code } = error;
        switch (code) {
          case 'auth/invalid-email': {
            throw new Error('Email không đúng');
          }
          case 'auth/user-not-found': {
            throw new Error('Không có tài khoản nào đã đăng ký với email này');
          }
          default:
            throw new Error('Chưa gởi được email, vui lòng thử lại!');
        }
      });
  }

  changePass = (newPass: string) => {
    return firebase
      .auth()
      .currentUser?.updatePassword(newPass)
      .catch(error => {
        const { code } = error;
        switch (code) {
          case 'auth/weak-password': {
            throw new Error('Mật khẩu không đủ mạnh');
          }
          case 'CREDENTIAL_TOO_OLD_LOGIN_AGAIN': {
            throw new Error(
              'Đăng xuất và đăng nhập lại vào phần mềm để thử lại!',
            );
          }
          default: {
            throw new Error('Chưa đổi được mật khẩu, vui lòng thử lại!');
          }
        }
      });
  };
}
