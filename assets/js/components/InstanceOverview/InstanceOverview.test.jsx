import React from 'react';
import { screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { databaseInstanceFactory } from '@lib/test-utils/factories';
import { renderWithRouter } from '@lib/test-utils';
import { DATABASE_TYPE, APPLICATION_TYPE } from '@lib/model';
import { faker } from '@faker-js/faker';
import InstanceOverview from './InstanceOverview';

describe('InstanceOverview', () => {
  it('renders HealthIcon for a registered instance', () => {
    const registeredDbInstance = databaseInstanceFactory.build();

    renderWithRouter(
      <InstanceOverview
        instanceType={APPLICATION_TYPE}
        instance={registeredDbInstance}
      />
    );
    const healthIcon = screen.getByTestId('eos-svg-component');
    expect(healthIcon).toBeDefined();
  });

  it('renders system replication data for database type', () => {
    const srInstance = databaseInstanceFactory.build({
      system_replication: 'Secondary',
      system_replication_status: 'ACTIVE',
    });

    renderWithRouter(
      <InstanceOverview instanceType={DATABASE_TYPE} instance={srInstance} />
    );

    const replicationText = screen.getByText('HANA Secondary');
    expect(replicationText).toBeInTheDocument();
  });

  it('renders tooltip content for absent instances', async () => {
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

    await act(async () => user.hover(screen.getByTestId('absent-tooltip')));
    await waitFor(() =>
      expect(
        screen.queryByText('Instance currently not registered.')
      ).toBeVisible()
    );
  });

  it('renders a clean up button for absent instances', () => {
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

  it('does not render a clean up button for registered instances', () => {
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
