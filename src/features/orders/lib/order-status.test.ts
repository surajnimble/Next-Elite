import { describe, expect, it } from 'vitest';
import type { OrderItem, OrderStatus } from '@/libs/models';
import {
  countInTransit,
  countOpen,
  isOrderStatus,
  STATUS_BADGE_VARIANT,
  sumRevenue,
  vendorNames,
} from './order-status';

function makeOrder(overrides: Partial<OrderItem> = {}): OrderItem {
  return {
    orderId: 'o1',
    orderNumber: 'ORD-1',
    status: 'PENDING',
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    itemCount: 1,
    totalQty: 1,
    subtotal: 100,
    discount: 0,
    couponDiscount: 0,
    taxAmount: 0,
    shippingAmount: 0,
    total: 100,
    balanceAmount: 100,
    isCancelled: false,
    createdAt: '2025-01-01T00:00:00.000Z',
    deliveredAt: '',
    vendorCount: 1,
    thumbnailList: [],
    subOrderList: [],
    ...overrides,
  };
}

describe('isOrderStatus', () => {
  it('accepts every backend ORDER_STATUS value', () => {
    for (const status of Object.keys(STATUS_BADGE_VARIANT)) {
      expect(isOrderStatus(status)).toBe(true);
    }
  });

  it('rejects anything else', () => {
    expect(isOrderStatus('shipped')).toBe(false);
    expect(isOrderStatus('')).toBe(false);
    expect(isOrderStatus('REFUNDED')).toBe(false);
  });
});

describe('countOpen', () => {
  it('counts statuses that still need fulfilment', () => {
    const orders = [
      makeOrder({ status: 'PENDING' }),
      makeOrder({ status: 'PENDING_TOKEN' }),
      makeOrder({ status: 'CONFIRMED' }),
      makeOrder({ status: 'SHIPPED' }),
      makeOrder({ status: 'DELIVERED' }),
      makeOrder({ status: 'CANCELLED' }),
    ];

    expect(countOpen(orders)).toBe(3);
  });

  it('is zero for an empty list', () => {
    expect(countOpen([])).toBe(0);
  });
});

describe('countInTransit', () => {
  it('counts only orders on the road', () => {
    const orders = [
      makeOrder({ status: 'SHIPPED' }),
      makeOrder({ status: 'OUT_FOR_DELIVERY' }),
      makeOrder({ status: 'PENDING' }),
      makeOrder({ status: 'DELIVERED' }),
    ];

    expect(countInTransit(orders)).toBe(2);
  });
});

describe('sumRevenue', () => {
  it('counts settled orders only, like the backend dashboard does', () => {
    const orders = [
      makeOrder({ total: 79.99, paymentStatus: 'PAID' }),
      makeOrder({ total: 159.97, paymentStatus: 'PAID' }),
      makeOrder({ total: 900, paymentStatus: 'COD_PENDING' }),
      makeOrder({ total: 500, paymentStatus: 'FAILED' }),
      makeOrder({ total: 300, paymentStatus: 'REFUNDED' }),
    ];

    expect(sumRevenue(orders)).toBeCloseTo(239.96, 2);
  });

  it('treats a missing total as zero', () => {
    const orders = [
      makeOrder({
        total: undefined as unknown as number,
        paymentStatus: 'PAID',
      }),
    ];

    expect(sumRevenue(orders)).toBe(0);
  });
});

describe('vendorNames', () => {
  it('lists each vendor shop once, in order', () => {
    const order = makeOrder({
      subOrderList: [
        {
          subOrderId: 's1',
          vendorId: 'v1',
          status: 'PENDING',
          total: 1,
          vendorData: { vendorId: 'v1', shopName: 'Acme', slug: 'acme' },
        },
        {
          subOrderId: 's2',
          vendorId: 'v2',
          status: 'PENDING',
          total: 1,
          vendorData: { vendorId: 'v2', shopName: 'Globex', slug: 'globex' },
        },
        {
          subOrderId: 's3',
          vendorId: 'v1',
          status: 'PENDING',
          total: 1,
          vendorData: { vendorId: 'v1', shopName: 'Acme', slug: 'acme' },
        },
      ],
    });

    expect(vendorNames(order)).toEqual(['Acme', 'Globex']);
  });

  it('skips blank and missing shop names', () => {
    const order = makeOrder({
      subOrderList: [
        {
          subOrderId: 's1',
          vendorId: 'v1',
          status: 'PENDING',
          total: 1,
          vendorData: {} as never,
        },
        {
          subOrderId: 's2',
          vendorId: 'v2',
          status: 'PENDING',
          total: 1,
          vendorData: { vendorId: 'v2', shopName: '   ', slug: '' },
        },
      ],
    });

    expect(vendorNames(order)).toEqual([]);
  });

  it('tolerates a missing subOrderList', () => {
    const order = makeOrder({
      subOrderList: undefined as unknown as OrderItem['subOrderList'],
    });
    expect(vendorNames(order)).toEqual([]);
  });
});

describe('STATUS_BADGE_VARIANT', () => {
  it('gives every status a badge variant', () => {
    const statuses: OrderStatus[] = [
      'PENDING',
      'PENDING_TOKEN',
      'CONFIRMED',
      'SHIPPED',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
      'RETURNED',
    ];

    for (const status of statuses) {
      expect(STATUS_BADGE_VARIANT[status]).toBeTruthy();
    }
  });
});
