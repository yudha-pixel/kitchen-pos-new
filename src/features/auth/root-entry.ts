export const getRootDestination = (isAuthenticated: boolean): '/login' | '/apps' =>
  isAuthenticated ? '/apps' : '/login';

