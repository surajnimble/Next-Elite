/**
 * Fallback version, used only when `API_BASE_URL` is the bare host. To move the
 * app onto v2, change it here or set `API_BASE_URL=.../api/v2` — never in a
 * path below.
 */
export const API_VERSION = 'v1';

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
