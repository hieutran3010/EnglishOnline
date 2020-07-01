import React from 'react';
import { Role } from 'app/models/user';
import { ReactNode } from 'react';
import authStorage from './authStorage';

const canRenderWithRole = (
  roles: Role[],
  node: ReactNode,
  keepCheckWithAdmin: boolean = false,
) => {
  const currentUser = authStorage.getUser();
  if (!keepCheckWithAdmin && currentUser.role === Role.ADMIN) {
    return node;
  }

  if (roles.includes(currentUser.role as Role)) {
    return node;
  }

  return <></>;
};

const willRenderIfNot = (roles: Role[], node: ReactNode) => {
  const currentUser = authStorage.getUser();
  if (roles.includes(currentUser.role as Role)) {
    return <></>;
  }

  return node;
};

export { canRenderWithRole, willRenderIfNot };
