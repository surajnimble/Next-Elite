import { renderWithProviders, screen } from '@tests/utils/render';
import { describe, expect, it } from 'vitest';
import {
  DashboardStatsGrid,
  type DashboardMetric,
} from './dashboard-stats-grid';

const metrics: DashboardMetric[] = [
  { key: 'totalUsers', icon: 'users', value: 12441 },
  { key: 'revenue30d', icon: 'currency', value: 54320 },
  { key: 'totalOrders', icon: 'cart', value: 1852 },
  { key: 'openTickets', icon: 'ticket', value: 0 },
];

describe('DashboardStatsGrid', () => {
  it('renders one stat card per metric', () => {
    const { container } = renderWithProviders(
      <DashboardStatsGrid metrics={metrics} />,
    );

    expect(container.querySelectorAll('[data-slot="stat-card"]')).toHaveLength(
      4,
    );
  });

  it('formats counts and currency per key', () => {
    renderWithProviders(<DashboardStatsGrid metrics={metrics} />);

    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('12,441')).toBeInTheDocument();
    expect(screen.getByText('1,852')).toBeInTheDocument();
    expect(screen.getByText('$54,320.00')).toBeInTheDocument();
  });
});
