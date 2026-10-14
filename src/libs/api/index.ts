/** Import calls and result handling from `@/libs/api`. */
export {
  getAllOrders,
  getAllProducts,
  getAllUsers,
  getDashboardStats,
  getProductFilters,
  login,
  logout,
  toggleProductStatus,
  toggleUserStatus,
} from './rest';
export { isApiFailure, isApiSuccess, isSessionDead } from './types';
export type {
  ApiErrorKind,
  ApiRequestOptions,
  ApiResult,
  HttpMethod,
} from './types';
export { apiFetch } from './rest-adapter';
