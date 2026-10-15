export interface BaseResponse<T> {
  status: boolean;
  message: string;
  result: T | null;
}

export interface ApiUserData {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: string;
  isActive?: boolean;
  rolesList?: string[];
  [key: string]: unknown;
}

export interface LoginResult {
  accessToken: string;
  expiresIn: number;
  twoFactorRequired: boolean;
  userData: ApiUserData;
  rolesList?: string[];
  [key: string]: unknown;
}

export interface DashboardStats {
  totalUsers: number;
  totalVendors: number;
  pendingVendors: number;
  totalProducts: number;
  totalOrders: number;
  revenue30d: number;
  openTickets: number;
  pendingReturns: number;
  pendingRefunds: number;
}

export interface UserItem {
  userId: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isTwoFactorEnabled: boolean;
  loyaltyTier: string;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
  vendorData: {
    vendorId: string;
    shopName: string;
    slug: string;
    status: string;
  };
  statsData: { orderCount: number; reviewCount: number };
  rolesList: string[];
}

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'all';

/** The backend merges these into `result` of every list response. */
export interface PaginatedResult {
  totalRecord: number;
  totalPage: number;
  currentPage: number;
  limit: number;
  hasNext: boolean;
  hasPrevious: boolean;
  nextPage: number;
  previousPage: number;
}

export interface UserFilterData {
  search: string;
  role: string;
  status: string;
  vendorStatus: string;
}

export interface UserListResult extends PaginatedResult {
  filterData: UserFilterData;
  userList: UserItem[];
}

export interface UserListQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: UserStatus;
  vendorStatus?: string;
}

export interface UserStatusResult {
  userId: string;
  isActive: boolean;
  status: 'ACTIVE' | 'SUSPENDED';
}

export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export interface ProductItem {
  productId: string;
  vendorId: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  mrpPrice: number;
  stock: number;
  condition: string;
  warrantyMonths: number;
  isNonReturnable: boolean;
  isActive: boolean;
  isFeatured: boolean;
  rating: number;
  soldCount: number;
  createdAt: string;
  categoryData: { categoryId: string; name: string };
  vendorData: { vendorId: string; shopName: string; slug: string };
  imageList: string[];
  reviewList: unknown[];
}

export interface ProductListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  categoryId?: string;
  brandId?: string;
  vendorId?: string;
  minPrice?: number;
  maxPrice?: number;
  /** `1` returns only products with stock. */
  inStock?: 1;
  isFeatured?: 1;
  status?: ProductStatus;
  rating?: number;
}

export interface ProductListResult extends PaginatedResult {
  filterData: {
    search: string;
    categoryId: string;
    brandId: string;
    vendorId: string;
    minPrice: number;
    maxPrice: number;
    inStock: boolean;
    isFeatured: boolean;
  };
  productList: ProductItem[];
}

export interface ProductFilters {
  categoryList: { categoryId: string; name: string; count: number }[];
  brandList: { brandId: string; name: string; count: number }[];
  vendorList: { vendorId: string; shopName: string; count: number }[];
  priceRange: { minPrice: number; maxPrice: number };
  attributeList: {
    attributeId: string;
    name: string;
    valueList: { value: string; label: string; count: number }[];
  }[];
}

export interface ProductStatusResult {
  productId: string;
  status: ProductStatus;
  isActive: boolean;
}

export interface SystemSettingItem {
  settingId: string;
  key: string;
  /** The backend stores `Json`, so this is whatever was written. */
  value: unknown;
  category: string;
  isPublic: boolean;
  updatedBy: string;
  updatedAt: string;
}

export interface SettingsListQuery {
  page?: number;
  limit?: number;
  category?: string;
  /** The backend takes these as strings, not booleans. */
  isPublic?: 'true' | 'false';
  sort?: string;
}

export interface SettingsListResult extends PaginatedResult {
  itemList: SystemSettingItem[];
}

export interface SettingsCategoryResult {
  category: string;
  settingList: Record<string, unknown>;
}

/** Flat key → value map, and it needs no auth — a regular user can read it. */
export type PublicSettingsResult = Record<string, unknown>;

export interface SettingsBulkResult {
  updatedCount: number;
}

/** A flat `feature.*` → boolean map; the list is built from this, never hard-coded. */
export type FeatureFlagsResult = Record<string, boolean>;

export interface SubAdminItem {
  userId: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isTwoFactorEnabled: boolean;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
  rolesList: string[];
}

export interface SubAdminListResult extends PaginatedResult {
  itemList: SubAdminItem[];
}

export interface RolePermissionsResult {
  roleList: Record<string, string[]>;
}

export interface SystemHealthResult {
  status: string;
  database: { ok: boolean; latencyMs: number };
  uptimeSeconds: number;
  memoryMb: number;
  nodeVersion: string;
  checkedAt: string;
}

export interface CronJob {
  name: string;
  queue: string;
  job: string;
  cron: string;
  description: string;
  nextRunAt: string;
  isRegistered: boolean;
}

export interface CronJobsResult {
  jobCount: number;
  jobList: CronJob[];
}

export interface AuditLogItem {
  auditLogId: string;
  actorId: string;
  actorRole: string;
  action: string;
  entity: string;
  entityId: string;
  description: string;
  changes: unknown;
  meta: unknown;
  ip: string;
  userAgent: string;
  createdAt: string;
  actorData: { userId: string; name: string; email: string };
}

export interface AuditLogQuery {
  page?: number;
  limit?: number;
  actorId?: string;
  action?: string;
  entity?: string;
  entityId?: string;
  from?: string;
  to?: string;
}

export interface AuditLogListResult extends PaginatedResult {
  itemList: AuditLogItem[];
}

export interface MaintenanceStatus {
  enabled: boolean;
  message: string;
  allowedIps: string[];
}

export interface FailedJob {
  failedJobId: string;
  queue: string;
  jobName: string;
  sourceJobId: string;
  status: string;
  error: string;
  attemptsMade: number;
  replayCount: number;
  resolvedBy: string;
  lastErrorAt: string;
  replayedAt: string;
  resolvedAt: string;
  createdAt: string;
  payloadData: unknown;
}

export interface FailedJobQuery {
  page?: number;
  limit?: number;
  status?: string;
  queue?: string;
  jobName?: string;
}

export interface FailedJobListResult extends PaginatedResult {
  pendingCount: number;
  filterData: {
    status: string;
    queue: string;
    jobName: string;
    search: string;
  };
  countsData: {
    pendingCount: number;
    resolvedCount: number;
    abandonedCount: number;
  };
  failedJobList: FailedJob[];
}

export interface ApiKeyItem {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  isActive: boolean;
  expiresAt: string;
  lastUsedAt: string;
  usageCount: number;
  createdAt: string;
  revokedAt: string;
}

export interface ApiKeyListResult {
  itemCount: number;
  itemList: ApiKeyItem[];
}

/** `key` is returned here and nowhere else. */
export interface CreatedApiKey {
  id: string;
  name: string;
  key: string;
  prefix: string;
  scopes: string[];
  expiresAt: string;
  createdAt: string;
}

export interface ImpersonationResult {
  accessToken: string;
  expiresIn: number;
  target: { id: string; name: string; email: string; role: string };
}

export type OrderStatus =
  | 'PENDING'
  | 'PENDING_TOKEN'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED';

export interface OrderItem {
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: string;
  itemCount: number;
  totalQty: number;
  subtotal: number;
  discount: number;
  couponDiscount: number;
  taxAmount: number;
  shippingAmount: number;
  total: number;
  balanceAmount: number;
  isCancelled: boolean;
  createdAt: string;
  deliveredAt: string;
  vendorCount: number;
  thumbnailList: string[];
  subOrderList: {
    subOrderId: string;
    vendorId: string;
    status: string;
    total: number;
    vendorData: { vendorId: string; shopName: string; slug: string };
  }[];
}

export interface OrderListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  status?: OrderStatus;
  paymentStatus?: string;
  paymentMethod?: string;
  vendorId?: string;
  from?: string;
  to?: string;
}

export interface OrderListResult extends PaginatedResult {
  itemList: OrderItem[];
}
