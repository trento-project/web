import React from 'react';
import { screen, waitFor, act, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { databaseInstanceFactory } from '@lib/test-utils/factories';
import { renderWithRouter } from '@lib/test-utils';
import { DATABASE_TYPE, APPLICATION_TYPE } from '@lib/model';
import { faker } from '@faker-js/faker';
import InstanceOverview from './InstanceOverview';

describe('InstanceOverview', () => {
  it('should render system replication data for database type', () => {
    const srInstance = databaseInstanceFactory.build({
      system_replication: 'Secondary',
      system_replication_status: 'ACTIVE',
    });

    renderWithRouter(
      <InstanceOverview instanceType={DATABASE_TYPE} instance={srInstance} />
    );

    expect(screen.getByText('HANA Secondary')).toBeInTheDocument();
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
  });

  it.each([
    { health: 'passing', expectedClass: 'fill-jungle-green-500' },
    { health: 'warning', expectedClass: 'fill-yellow-500' },
    { health: 'critical', expectedClass: 'fill-red-500' },
  ])(
    'should render $expectedClass for an instance with $health health',
    ({ health, expectedClass }) => {
      const registeredDbInstance = databaseInstanceFactory.build({
        health: health,
      });

      renderWithRouter(
        <InstanceOverview
          instanceType={APPLICATION_TYPE}
          instance={registeredDbInstance}
        />
      );
      const healthIcon = screen.getByTestId('eos-svg-component');
      expect(healthIcon).toBeDefined();
      expect(healthIcon).toHaveClass(expectedClass);
    }
  );

  it('should render an absent HealthIcon and a tooltip content for absent instances', async () => {
    const user = userEvent.setup();

    const absentInstance = databaseInstanceFactory.build({
      absent_at: faker.date.past().toISOString(),
    });

    renderWithRouter(
      <InstanceOverview
        instanceType={APPLICATION_TYPE}
        instance={absentInstance}
      />
    );

    const tooltip = screen.getByTestId('absent-tooltip');
    expect(within(tooltip).getByTestId('eos-svg-component')).toHaveClass(
      'fill-black'
    );
    await act(async () => user.hover(tooltip));
    await waitFor(() =>
      expect(screen.queryByText('Instance currently not found.')).toBeVisible()
    );
  });

  it('should render a clean up button for absent instances', () => {
    const absentInstance = databaseInstanceFactory.build({
      absent_at: faker.date.past().toISOString(),
    });

    renderWithRouter(
      <InstanceOverview
        instanceType={APPLICATION_TYPE}
        instance={absentInstance}
      />
    );

    expect(screen.queryByRole('button', { name: 'Clean up' })).toBeVisible();
  });

  it('should not render a clean up button for present instances', () => {
    const registeredDbInstance = databaseInstanceFactory.build();

    renderWithRouter(
      <InstanceOverview
        instanceType={APPLICATION_TYPE}
        instance={registeredDbInstance}
      />
    );

    expect(
      screen.queryByRole('button', { name: 'Clean up' })
    ).not.toBeInTheDocument();
  });
});
