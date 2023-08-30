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

    const replicationText = screen.getByText('HANA Secondary');
    expect(replicationText).toBeInTheDocument();

    const replicationStatus = screen.getByText('ACTIVE');
    expect(replicationStatus).toBeInTheDocument();
  });

  it('should not render an absent HealthIcon for a present instance', () => {
    const registeredDbInstance = databaseInstanceFactory.build({
      health: 'passing',
    });

    renderWithRouter(
      <InstanceOverview
        instanceType={APPLICATION_TYPE}
        instance={registeredDbInstance}
      />
    );
    const healthIcon = screen.getByTestId('eos-svg-component');
    expect(healthIcon).toBeDefined();
    expect(healthIcon).not.toHaveClass('fill-black');
  });

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
