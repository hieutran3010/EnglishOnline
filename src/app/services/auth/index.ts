import { AuthService } from './AuthService';
import authStorage from './authStorage';
import * as authorizeHelper from './helper';

const authService = new AuthService();
export { authService, authStorage, authorizeHelper };
