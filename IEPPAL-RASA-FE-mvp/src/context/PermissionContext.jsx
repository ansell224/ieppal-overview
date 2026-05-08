import { useAuth } from './AuthContext';

export function usePermissions() {
  const { user } = useAuth();
  const permissions = user?.permissions || {};

  const can = (resource, level = 'view') => {
    if (user?.role === 'ADMIN') return true;
    const perm = permissions[resource];
    if (!perm || perm === 'none') return false;
    if (level === 'view') return perm === 'view' || perm === 'manage';
    if (level === 'manage') return perm === 'manage';
    return false;
  };

  return { can, permissions };
}
