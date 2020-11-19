import { AuthService } from './AuthService';
import authStorage from './authStorage';

const authService = new AuthService();
export { authService, authStorage };
