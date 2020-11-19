import User from 'app/models/user';
import { isEmpty } from 'lodash';

const CACHE_KEY = {
  USER: 'USER',
};
class AuthStorage {
  storeUser = (user: User) => {
    localStorage.setItem(CACHE_KEY.USER, JSON.stringify(user));
  };

  getUser = (): User => {
    const userStr = localStorage.getItem(CACHE_KEY.USER);
    if (userStr && !isEmpty(userStr)) {
      return JSON.parse(userStr) as User;
    }
    return new User();
  };

  clear = () => {
    localStorage.removeItem(CACHE_KEY.USER);
  };
}

const authStorage = new AuthStorage();
export default authStorage;
