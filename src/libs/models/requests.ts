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

export interface ToggleStatusRequest {
  isActive: boolean;
  reason?: string;
}

export interface ToggleProductStatusRequest {
  status: ProductStatus;
}

export interface UpdateSettingRequest {
  key: string;
  value: unknown;
  category?: string;
  isPublic?: boolean;
}

export interface BulkUpdateSettingsRequest {
  settings: UpdateSettingRequest[];
}

export interface ToggleFeatureRequest {
  key: string;
  enabled: boolean;
}

export interface CreateSubAdminRequest {
  name: string;
  email: string;
  phone?: string;
  password: string;
  permissions?: string[];
}

export interface UpdateSubAdminRequest {
  name?: string;
  phone?: string;
  permissions?: string[];
}

export interface SetPermissionsRequest {
  permissions: string[];
}

export interface UpdateMaintenanceRequest {
  enabled: boolean;
  message?: string;
  /** The backend also accepts a CSV string here. */
  allowedIps?: string[];
}

export interface TriggerJobRequest {
  name: string;
}

export interface CreateApiKeyRequest {
  name: string;
  scopes?: string[];
  expiresInDays?: number;
}

export interface ImpersonateUserRequest {
  reason: string;
  durationMin?: number;
}

/**
 * The route validates with `toggleFeatureSchema` and the controller reads
 * `req.body.enabled`, so the shape is `{ key, enabled }` — not `{ isActive }`.
 */
export interface ToggleSubAdminStatusRequest {
  key: string;
  enabled: boolean;
}