import React from 'react';
import { screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { databaseInstanceFactory } from '@lib/test-utils/factories';
import { renderWithRouter } from '@lib/test-utils';
import { faker } from '@faker-js/faker';
import { DATABASE_TYPE, APPLICATION_TYPE } from '@lib/model/sapSystems';
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
        health,
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

  it('should render an absent HealthIcon, tooltip content and clean up button for absent instances', async () => {
    const user = userEvent.setup();

    const absentInstance = databaseInstanceFactory.build({
      absent_at: faker.date.past().toISOString(),
    });

    renderWithRouter(
      <InstanceOverview
        instanceType={APPLICATION_TYPE}
        instance={absentInstance}
        userAbilities={[{ name: 'all', resource: 'all' }]}
      />
    );

    const [healthIcon, _cleanUpIcon] =
      screen.getAllByTestId('eos-svg-component');
    expect(healthIcon).toHaveClass('fill-black');
    expect(screen.queryByRole('button', { name: 'Clean up' })).toBeVisible();
    await act(async () => user.hover(healthIcon));
    await waitFor(() =>
      expect(screen.queryByText('Registered instance not found.')).toBeVisible()
    );
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

  it('should render a clean up button in cleaning state', () => {
    const absentInstance = databaseInstanceFactory.build({
      absent_at: faker.date.past().toISOString(),
      deregistering: true,
    });

    renderWithRouter(
      <InstanceOverview
        instanceType={DATABASE_TYPE}
        instance={absentInstance}
        userAbilities={[{ name: 'all', resource: 'all' }]}
      />
    );

    expect(screen.getByLabelText('Loading')).toBeInTheDocument();
  });

  it('should forbid instance cleanup', async () => {
    const user = userEvent.setup();

    const absentInstance = databaseInstanceFactory.build({
      absent_at: faker.date.past().toISOString(),
    });

    renderWithRouter(
      <InstanceOverview
        instanceType={DATABASE_TYPE}
        instance={absentInstance}
        userAbilities={[]}
      />
    );

    const cleanUpButton = screen.getByText('Clean up').closest('button');

    expect(cleanUpButton).toBeDisabled();

    await user.click(cleanUpButton);

    await user.hover(cleanUpButton);

    expect(
      screen.queryByText('You are not authorized for this action')
    ).toBeVisible();
  });
});
