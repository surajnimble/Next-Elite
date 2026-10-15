import 'server-only';

import type {
  ApiKeyItem,
  ApiKeyListResult,
  ApiRequest,
  AuditLogListResult,
  AuditLogQuery,
  BulkUpdateSettingsRequest,
  CreatedApiKey,
  CreateApiKeyRequest,
  CreateSubAdminRequest,
  CronJobsResult,
  DashboardStats,
  FailedJobListResult,
  FailedJobQuery,
  FeatureFlagsResult,
  ImpersonateUserRequest,
  ImpersonationResult,
  LoginResult,
  MaintenanceStatus,
  OrderListQuery,
  OrderListResult,
  ProductFilters,
  ProductListQuery,
  ProductListResult,
  ProductStatusResult,
  PublicSettingsResult,
  RolePermissionsResult,
  SetPermissionsRequest,
  SettingsBulkResult,
  SettingsCategoryResult,
  SettingsListQuery,
  SettingsListResult,
  SubAdminItem,
  SubAdminListResult,
  SystemHealthResult,
  ToggleFeatureRequest,
  ToggleProductStatusRequest,
  ToggleStatusRequest,
  ToggleSubAdminStatusRequest,
  TriggerJobRequest,
  UpdateMaintenanceRequest,
  UpdateSettingRequest,
  UpdateSubAdminRequest,
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

/** Admin only. */
export function getAllUsers(
  query: UserListQuery = {},
  options: ApiRequestOptions = {},
) {
  return apiFetch<UserListResult>('GET', API_URLS.getAllUsers, undefined, {
    ...options,
    query: { ...query },
  });
}

/** Admin only. */
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

/** Admin only, and scoped to the caller — an admin sees only their own orders. */
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

/** Admin only. */
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

/** Admin only. */
export function getSettings(
  query: SettingsListQuery = {},
  options: ApiRequestOptions = {},
) {
  return apiFetch<SettingsListResult>('GET', API_URLS.getSettings, undefined, {
    ...options,
    query: { ...query },
  });
}

/**
 * Needs no auth. This is how a non-admin reads the locale and cart settings
 * that the admin-only list endpoint would refuse to serve.
 */
export function getPublicSettings(options: ApiRequestOptions = {}) {
  return apiFetch<PublicSettingsResult>(
    'GET',
    API_URLS.getPublicSettings,
    undefined,
    options,
  );
}

/** Admin only. Returns one category as a flat key → value map. */
export function getSettingsByCategory(
  category: string,
  options: ApiRequestOptions = {},
) {
  return apiFetch<SettingsCategoryResult>(
    'GET',
    `${API_URLS.getSettingsByCategory}/${category}`,
    undefined,
    options,
  );
}

/** Admin only. */
export function updateSetting(
  body: UpdateSettingRequest,
  options: ApiRequestOptions = {},
) {
  return apiFetch('PATCH', API_URLS.updateSetting, body, options);
}

/** Admin only. Accepts up to 100 keys in one call. */
export function bulkUpdateSettings(
  body: BulkUpdateSettingsRequest,
  options: ApiRequestOptions = {},
) {
  return apiFetch<SettingsBulkResult>(
    'POST',
    API_URLS.bulkUpdateSettings,
    body,
    options,
  );
}

/** Needs no auth. */
export function getFeatureFlags(options: ApiRequestOptions = {}) {
  return apiFetch<FeatureFlagsResult>(
    'GET',
    API_URLS.getFeatureFlags,
    undefined,
    options,
  );
}

/** Admin only. */
export function toggleFeature(
  body: ToggleFeatureRequest,
  options: ApiRequestOptions = {},
) {
  return apiFetch('PATCH', API_URLS.toggleFeature, body, options);
}

export function getSubAdmins(
  query: SettingsListQuery = {},
  options: ApiRequestOptions = {},
) {
  return apiFetch<SubAdminListResult>('GET', API_URLS.getSubAdmins, undefined, {
    ...options,
    query: { ...query },
  });
}

/** Super admin only. */
export function createSubAdmin(
  body: CreateSubAdminRequest,
  options: ApiRequestOptions = {},
) {
  return apiFetch<SubAdminItem>('POST', API_URLS.createSubAdmin, body, options);
}

/** Super admin only. */
export function updateSubAdmin(
  id: string,
  body: UpdateSubAdminRequest,
  options: ApiRequestOptions = {},
) {
  return apiFetch<SubAdminItem>(
    'PATCH',
    `${API_URLS.updateSubAdmin}/${id}`,
    body,
    options,
  );
}

/** Super admin only. */
export function deleteSubAdmin(id: string, options: ApiRequestOptions = {}) {
  return apiFetch(
    'DELETE',
    `${API_URLS.deleteSubAdmin}/${id}`,
    undefined,
    options,
  );
}

/**
 * Super admin only. Validates with `toggleFeatureSchema` and the controller
 * reads `req.body.enabled`, so the wire shape is `{ key, enabled }` — sending
 * `{ isActive }` is a 400.
 */
export function toggleSubAdminStatus(
  id: string,
  body: ToggleSubAdminStatusRequest,
  options: ApiRequestOptions = {},
) {
  return apiFetch<SubAdminItem>(
    'PATCH',
    `${API_URLS.toggleSubAdminStatus}/${id}`,
    body,
    options,
  );
}

export function getPermissions(options: ApiRequestOptions = {}) {
  return apiFetch<RolePermissionsResult>(
    'GET',
    API_URLS.getPermissions,
    undefined,
    options,
  );
}

export function setPermissions(
  role: string,
  body: SetPermissionsRequest,
  options: ApiRequestOptions = {},
) {
  return apiFetch('PATCH', `${API_URLS.setPermissions}/${role}`, body, options);
}

export function getSystemHealth(options: ApiRequestOptions = {}) {
  return apiFetch<SystemHealthResult>(
    'GET',
    API_URLS.getSystemHealth,
    undefined,
    options,
  );
}

/** Super admin only. */
export function getCronJobs(options: ApiRequestOptions = {}) {
  return apiFetch<CronJobsResult>(
    'GET',
    API_URLS.getCronJobs,
    undefined,
    options,
  );
}

export function getAuditLogs(
  query: AuditLogQuery = {},
  options: ApiRequestOptions = {},
) {
  return apiFetch<AuditLogListResult>('GET', API_URLS.getAuditLogs, undefined, {
    ...options,
    query: { ...query },
  });
}

/** Super admin only. */
export function triggerJob(
  body: TriggerJobRequest,
  options: ApiRequestOptions = {},
) {
  return apiFetch('POST', API_URLS.triggerJob, body, options);
}

/** Super admin only. */
export function getFailedJobs(
  query: FailedJobQuery = {},
  options: ApiRequestOptions = {},
) {
  return apiFetch<FailedJobListResult>(
    'GET',
    API_URLS.getFailedJobs,
    undefined,
    {
      ...options,
      query: { ...query },
    },
  );
}

/** Super admin only. */
export function retryFailedJob(id: string, options: ApiRequestOptions = {}) {
  return apiFetch(
    'POST',
    `${API_URLS.retryFailedJob}/${id}`,
    undefined,
    options,
  );
}

/** Super admin only. */
export function resolveFailedJob(id: string, options: ApiRequestOptions = {}) {
  return apiFetch(
    'PATCH',
    `${API_URLS.resolveFailedJob}/${id}`,
    undefined,
    options,
  );
}

/** Super admin only. */
export function deleteFailedJob(id: string, options: ApiRequestOptions = {}) {
  return apiFetch(
    'DELETE',
    `${API_URLS.deleteFailedJob}/${id}`,
    undefined,
    options,
  );
}

/** Super admin only. */
export function clearCache(options: ApiRequestOptions = {}) {
  return apiFetch('POST', API_URLS.clearCache, {}, options);
}

/** Readable without auth on the backend. */
export function getMaintenance(options: ApiRequestOptions = {}) {
  return apiFetch<MaintenanceStatus>(
    'GET',
    API_URLS.getMaintenance,
    undefined,
    options,
  );
}

/** Super admin only. `allowedIps` accepts a CSV string or an array. */
export function updateMaintenance(
  body: UpdateMaintenanceRequest,
  options: ApiRequestOptions = {},
) {
  return apiFetch<MaintenanceStatus>(
    'PATCH',
    API_URLS.updateMaintenance,
    body,
    options,
  );
}

/** Any admin. */
export function getApiKeys(options: ApiRequestOptions = {}) {
  return apiFetch<ApiKeyListResult>(
    'GET',
    API_URLS.getApiKeys,
    undefined,
    options,
  );
}

/** Super admin only. The secret is returned only here. */
export function createApiKey(
  body: CreateApiKeyRequest,
  options: ApiRequestOptions = {},
) {
  return apiFetch<CreatedApiKey>('POST', API_URLS.createApiKey, body, options);
}

/** Any admin. */
export function revokeApiKey(id: string, options: ApiRequestOptions = {}) {
  return apiFetch<ApiKeyItem>(
    'PATCH',
    `${API_URLS.revokeApiKey}/${id}`,
    undefined,
    options,
  );
}

/** Super admin only. */
export function deleteApiKey(id: string, options: ApiRequestOptions = {}) {
  return apiFetch(
    'DELETE',
    `${API_URLS.deleteApiKey}/${id}`,
    undefined,
    options,
  );
}

/**
 * Super admin only. Returns a short-lived token scoped to the target; the
 * backend writes every impersonation to AuditLog.
 */
export function impersonateUser(
  id: string,
  body: ImpersonateUserRequest,
  options: ApiRequestOptions = {},
) {
  return apiFetch<ImpersonationResult>(
    'POST',
    `${API_URLS.impersonateUser}/${id}`,
    body,
    options,
  );
}