import type { ProductStatus } from './responses';

export interface LoginDeviceData {
  deviceId: string;
  platform: string;
  appVersion: string;
  model: string;
  locale: string;
  timezone: string;
}

export interface ApiRequest {
  email?: string;
  password?: string;
  phone?: string;
  deviceData?: LoginDeviceData;
}

/** Body for `PATCH /users/toggleStatus/:id`. */
export interface ToggleStatusRequest {
  isActive: boolean;
  reason?: string;
}

/** Body for `PATCH /products/toggleStatus/:id`. */
export interface ToggleProductStatusRequest {
  status: ProductStatus;
}
