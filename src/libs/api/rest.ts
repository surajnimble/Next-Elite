import 'server-only';

import type {
  ApiRequest,
  DashboardStats,
  LoginResult,
  OrderListQuery,
  OrderListResult,
  ProductFilters,
  ProductListQuery,
  ProductListResult,
  ProductStatusResult,
  ToggleProductStatusRequest,
  ToggleStatusRequest,
  UserListQuery,
  UserListResult,
  UserStatusResult,
} from '@/libs/models';
import { API_URLS } from './api-urls';
import { apiFetch } from './rest-adapter';
import type { ApiRequestOptions } from './types';

export function login(request: ApiRequest) {
  return apiFetch<LoginResult>('POST', API_URLS.login, request);
}

export function logout(options: ApiRequestOptions = {}) {
  return apiFetch('POST', API_URLS.logout, {}, options);
}

export function getDashboardStats(options: ApiRequestOptions = {}) {
  return apiFetch<DashboardStats>(
    'GET',
    API_URLS.getDashboardStats,
    undefined,
    options,
  );
}

/** `GET /users/getAll` — admin user list with filters and pagination. */
export function getAllUsers(
  query: UserListQuery = {},
  options: ApiRequestOptions = {},
) {
  return apiFetch<UserListResult>('GET', API_URLS.getAllUsers, undefined, {
    ...options,
    query: { ...query },
  });
}

/** `GET /products/getAll` — product list with filters and pagination. */
export function getAllProducts(
  query: ProductListQuery = {},
  options: ApiRequestOptions = {},
) {
  return apiFetch<ProductListResult>(
    'GET',
    API_URLS.getAllProducts,
    undefined,
    {
      ...options,
      query: { ...query },
    },
  );
}

/** `GET /orders/getAll` — order list with filters and pagination. */
export function getAllOrders(
  query: OrderListQuery = {},
  options: ApiRequestOptions = {},
) {
  return apiFetch<OrderListResult>('GET', API_URLS.getAllOrders, undefined, {
    ...options,
    query: { ...query },
  });
}
export function getProductFilters(
  query: { categoryId?: string; vendorId?: string; brandId?: string } = {},
  options: ApiRequestOptions = {},
) {
  return apiFetch<ProductFilters>(
    'GET',
    API_URLS.getProductFilters,
    undefined,
    {
      ...options,
      query: { ...query },
    },
  );
}

/** `PATCH /products/toggleStatus/:id` — publish, unpublish or archive. */
export function toggleProductStatus(
  id: string,
  body: ToggleProductStatusRequest,
  options: ApiRequestOptions = {},
) {
  return apiFetch<ProductStatusResult>(
    'PATCH',
    `${API_URLS.toggleProductStatus}/${id}`,
    body,
    options,
  );
}
export function toggleUserStatus(
  id: string,
  body: ToggleStatusRequest,
  options: ApiRequestOptions = {},
) {
  return apiFetch<UserStatusResult>(
    'PATCH',
    `${API_URLS.toggleUserStatus}/${id}`,
    body,
    options,
  );
}
