import { renderWithProviders, screen, within } from '@tests/utils/render';
import type { OrderItem, PaginatedResult } from '@/libs/models';
import { describe, expect, it } from 'vitest';
import { OrdersTable } from './orders-table';

function makeOrder(overrides: Partial<OrderItem> = {}): OrderItem {
  return {
    orderId: 'clx0order0001',
    orderNumber: 'ORD-2025-015',
    status: 'PENDING',
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    itemCount: 1,
    totalQty: 1,
    subtotal: 79.99,
    discount: 0,
    couponDiscount: 0,
    taxAmount: 0,
    shippingAmount: 0,
    total: 79.99,
    balanceAmount: 79.99,
    isCancelled: false,
    createdAt: '2025-01-01T00:00:00.000Z',
    deliveredAt: '',
    vendorCount: 1,
    thumbnailList: [],
    subOrderList: [
      {
        subOrderId: 's1',
        vendorId: 'v1',
        status: 'PENDING',
        total: 79.99,
        vendorData: { vendorId: 'v1', shopName: 'Acme Store', slug: 'acme' },
      },
    ],
    ...overrides,
  };
}

const pagination: PaginatedResult = {
  totalRecord: 20,
  totalPage: 2,
  currentPage: 1,
  limit: 10,
  hasNext: true,
  hasPrevious: false,
  nextPage: 2,
  previousPage: 0,
};

describe('OrdersTable', () => {
  it('renders a row per order with number, id, vendor, items, total and status', () => {
    renderWithProviders(
      <OrdersTable
        orders={[
          makeOrder(),
          makeOrder({
            orderId: 'clx0order0002',
            orderNumber: 'ORD-2025-014',
            status: 'DELIVERED',
          }),
        ]}
        pagination={pagination}
        search=""
        status=""
        from=""
        to=""
      />,
    );

    const rows = within(screen.getByRole('table'));

    expect(rows.getByText('ORD-2025-015')).toBeInTheDocument();
    expect(rows.getByText('ORD-2025-014')).toBeInTheDocument();
    expect(rows.getByText('ID: clx0order0001')).toBeInTheDocument();
    expect(rows.getAllByText('Acme Store')).toHaveLength(2);
    expect(rows.getAllByText('$79.99')).toHaveLength(2);
    expect(rows.getByText('Pending')).toBeInTheDocument();
    expect(rows.getByText('Delivered')).toBeInTheDocument();
  });

  it('shows the item count and the extra unit count', () => {
    renderWithProviders(
      <OrdersTable
        orders={[makeOrder({ itemCount: 3, totalQty: 7 })]}
        pagination={pagination}
        search=""
        status=""
        from=""
        to=""
      />,
    );

    expect(screen.getByText('3 items')).toBeInTheDocument();
    expect(screen.getByText('7 units')).toBeInTheDocument();
  });

  it('collapses vendors past the second into a counter', () => {
    renderWithProviders(
      <OrdersTable
        orders={[
          makeOrder({
            subOrderList: [
              {
                subOrderId: 's1',
                vendorId: 'v1',
                status: 'PENDING',
                total: 1,
                vendorData: { vendorId: 'v1', shopName: 'Acme', slug: 'a' },
              },
              {
                subOrderId: 's2',
                vendorId: 'v2',
                status: 'PENDING',
                total: 1,
                vendorData: { vendorId: 'v2', shopName: 'Globex', slug: 'g' },
              },
              {
                subOrderId: 's3',
                vendorId: 'v3',
                status: 'PENDING',
                total: 1,
                vendorData: { vendorId: 'v3', shopName: 'Initech', slug: 'i' },
              },
            ],
          }),
        ]}
        pagination={pagination}
        search=""
        status=""
        from=""
        to=""
      />,
    );

    expect(screen.getByText('Acme')).toBeInTheDocument();
    expect(screen.getByText('Globex')).toBeInTheDocument();
    expect(screen.queryByText('Initech')).not.toBeInTheDocument();
    expect(screen.getByText('1 vendors')).toBeInTheDocument();
  });

  it('falls back when an order has no vendor', () => {
    renderWithProviders(
      <OrdersTable
        orders={[makeOrder({ subOrderList: [] })]}
        pagination={pagination}
        search=""
        status=""
        from=""
        to=""
      />,
    );

    expect(screen.getByText('No vendor')).toBeInTheDocument();
  });

  it('shows the empty state instead of a table when nothing matches', () => {
    renderWithProviders(
      <OrdersTable
        orders={[]}
        pagination={{
          ...pagination,
          totalRecord: 0,
          totalPage: 0,
          hasNext: false,
        }}
        search="nope"
        status=""
        from=""
        to=""
      />,
    );

    expect(
      screen.getByText('No orders match these filters.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Showing 1 to 10 of 20 results'),
    ).not.toBeInTheDocument();
  });

  it('renders the pagination range from the current page', () => {
    renderWithProviders(
      <OrdersTable
        orders={[makeOrder(), makeOrder({ orderId: 'clx0order0002' })]}
        pagination={pagination}
        search=""
        status=""
        from=""
        to=""
      />,
    );

    expect(
      screen.getByText('Showing 1 to 2 of 20 results'),
    ).toBeInTheDocument();
  });

  it('only offers a Clear button once a filter is active', () => {
    const { rerender } = renderWithProviders(
      <OrdersTable
        orders={[makeOrder()]}
        pagination={pagination}
        search=""
        status=""
        from=""
        to=""
      />,
    );

    expect(
      screen.queryByRole('button', { name: 'Clear' }),
    ).not.toBeInTheDocument();

    rerender(
      <OrdersTable
        orders={[makeOrder()]}
        pagination={pagination}
        search="acme"
        status=""
        from=""
        to=""
      />,
    );

    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
  });
});
