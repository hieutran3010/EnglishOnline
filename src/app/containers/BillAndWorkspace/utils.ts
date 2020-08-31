import { Role } from 'app/models/user';
import { authStorage } from 'app/services/auth';

const checkCanEditHistory = (role: Role, saleUserId: string | undefined) => {
  if (role === Role.ADMIN || role === Role.LICENSE) {
    return true;
  }

  if (role === Role.ACCOUNTANT) {
    return false;
  }

  const user = authStorage.getUser();
  if (role === Role.SALE) {
    return saleUserId === user.id;
  }

  return false;
};

export { checkCanEditHistory };
