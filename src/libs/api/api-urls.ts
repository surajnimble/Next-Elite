export const API_URLS = {
  login: 'auth/login',
  logout: 'auth/logout',
  getDashboardStats: 'admin/getDashboardStats',
  getAllUsers: 'users/getAll',
  toggleUserStatus: 'users/toggleStatus',
  getAllProducts: 'products/getAll',
  getProductFilters: 'products/getFilters',
  toggleProductStatus: 'products/toggleStatus',
  getAllOrders: 'orders/getAll',
} as const;

export type ApiUrl = (typeof API_URLS)[keyof typeof API_URLS];
