export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'stock_manager' | 'viewer';
  token?: string;
};
