export const getRootDestination = (isAuthenticated: boolean): '/login' | '/pos' =>
  isAuthenticated ? '/pos' : '/login';
