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
  getSettings: 'settings/getAll',
  getPublicSettings: 'settings/getPublicSettings',
  getSettingsByCategory: 'settings/getByCategory',
  updateSetting: 'settings/updateSetting',
  bulkUpdateSettings: 'settings/bulkUpdateSettings',
  getFeatureFlags: 'settings/getFeatureFlags',
  toggleFeature: 'settings/toggleFeature',
  getSubAdmins: 'admin/getAllSubAdmins',
  createSubAdmin: 'admin/createSubAdmin',
  updateSubAdmin: 'admin/updateSubAdmin',
  deleteSubAdmin: 'admin/deleteSubAdmin',
  toggleSubAdminStatus: 'admin/toggleSubAdminStatus',
  getPermissions: 'admin/getPermissions',
  setPermissions: 'admin/updatePermissions',
  getSystemHealth: 'admin/getSystemHealth',
  getCronJobs: 'admin/getCronJobs',
  getAuditLogs: 'admin/getAuditLogs',
  triggerJob: 'admin/triggerJob',
  getFailedJobs: 'admin/getFailedJobs',
  retryFailedJob: 'admin/retryFailedJob',
  resolveFailedJob: 'admin/resolveFailedJob',
  deleteFailedJob: 'admin/deleteFailedJob',
  clearCache: 'admin/clearCache',
  getMaintenance: 'settings/getMaintenance',
  updateMaintenance: 'settings/updateMaintenance',
  getApiKeys: 'apiKeys/getAll',
  createApiKey: 'apiKeys/create',
  revokeApiKey: 'apiKeys/revoke',
  deleteApiKey: 'apiKeys/delete',
  impersonateUser: 'users/impersonate',
} as const;

export type ApiUrl = (typeof API_URLS)[keyof typeof API_URLS];
