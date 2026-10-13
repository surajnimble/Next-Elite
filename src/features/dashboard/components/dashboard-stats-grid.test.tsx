import { renderWithProviders, screen } from '@tests/utils/render';
import { describe, expect, it } from 'vitest';
import type { DashboardStats } from '../types';
import { DashboardStatsGrid } from './dashboard-stats-grid';

const stats: DashboardStats = {
  totalUsers: 5,
  totalVendors: 1,
  pendingVendors: 0,
  totalProducts: 4,
  totalOrders: 0,
  revenue30d: 1234.5,
  openTickets: 0,
  pendingReturns: 0,
  pendingRefunds: 0,
};

describe('DashboardStatsGrid', () => {
  it('renders every metric with its translated label and formatted value', () => {
    renderWithProviders(<DashboardStatsGrid stats={stats} />);

    expect(screen.getByText('Total users')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Total vendors')).toBeInTheDocument();
    expect(screen.getByText('Total products')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('Revenue (30 days)')).toBeInTheDocument();
    expect(screen.getByText('1,234.5')).toBeInTheDocument();
    expect(screen.getByText('Pending refunds')).toBeInTheDocument();
  });
});
