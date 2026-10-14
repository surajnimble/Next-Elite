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

/** One row of `GET /users/getAll` — mirrors the backend's `serializeUser`. */
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

/** Pagination the backend merges into `result` of every list response. */
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

/** The filters the backend echoes back with the list. */
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

/** Query for `GET /users/getAll`; every field is optional. */
export interface UserListQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: UserStatus;
  vendorStatus?: string;
}

/** `result` of `PATCH /users/toggleStatus/:id`. */
export interface UserStatusResult {
  userId: string;
  isActive: boolean;
  status: 'ACTIVE' | 'SUSPENDED';
}

/** Backend `PRODUCT_STATUS`. */
export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

/** One row of `GET /products/getAll` — mirrors `serializeProductSummary`. */
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

/** Query for `GET /products/getAll`; every field is optional. */
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

/** `result` of `GET /products/getFilters` — used to fill the filter dropdowns. */
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

/** `result` of `PATCH /products/toggleStatus/:id`. */
export interface ProductStatusResult {
  productId: string;
  status: ProductStatus;
  isActive: boolean;
}

/** Backend `ORDER_STATUS`. */
export type OrderStatus =
  | 'PENDING'
  | 'PENDING_TOKEN'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED';

/** One row of `GET /orders/getAll` — mirrors `serializeOrderSummary`. */
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
