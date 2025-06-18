import React from 'react';

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { noop } from 'lodash';

import AbilitiesMultiSelect from './AbilitiesMultiSelect';

describe('AbilitiesMultiSelect Component', () => {
  it('should group abilities', async () => {
    const user = userEvent.setup();

    const groups = [
      'all:checks_selection',
      'all:checks_execution',
      'cleanup:all',
      'operation:all',
    ];
    const abilities = [
      { id: 1, name: 'all', resource: 'host_checks_selection' },
      { id: 2, name: 'all', resource: 'cluster_checks_selection' },
      { id: 3, name: 'all', resource: 'host_checks_execution' },
      { id: 4, name: 'all', resource: 'cluster_checks_execution' },
      { id: 5, name: 'cleanup', resource: 'host' },
      { id: 6, name: 'cleanup', resource: 'database_instance' },
      { id: 7, name: 'cleanup', resource: 'application_instance' },
      { id: 8, name: 'all', resource: 'host_tags' },
      { id: 9, name: 'all', resource: 'cluster_tags' },
      { id: 10, name: 'all', resource: 'database_tags' },
      { id: 11, name: 'all', resource: 'sap_system_tags' },
      { id: 12, name: 'all', resource: 'api_key_settings' },
      { id: 13, name: 'all', resource: 'suma_settings' },
      { id: 14, name: 'all', resource: 'activity_logs_settings' },
      { id: 15, name: 'saptune_solution_apply', resource: 'host' },
      { id: 16, name: 'saptune_solution_change', resource: 'host' },
      { id: 17, name: 'maintenance_change', resource: 'cluster' },
      { id: 18, name: 'pacemaker_enable', resource: 'cluster' },
      { id: 19, name: 'pacemaker_disable', resource: 'cluster' },
      { id: 20, name: 'start', resource: 'application_instance' },
      { id: 21, name: 'stop', resource: 'application_instance' },
    ];

    render(
      <AbilitiesMultiSelect
        abilities={abilities}
        userAbilities={[]}
        setAbilities={noop}
        operationsEnabled
      />
    );

    await user.click(screen.getByLabelText('permissions'));
    groups.forEach((group) => {
      expect(screen.getByText(group)).toBeVisible();
    });

    abilities.forEach(({ name, resource }) => {
      expect(screen.queryByText(`${name}:${resource}`)).not.toBeInTheDocument();
    });

    await user.click(screen.getByText('all:checks_selection'));
    await user.click(screen.getByLabelText('permissions'));
    await user.click(screen.getByText('all:checks_execution'));
    await user.click(screen.getByLabelText('permissions'));
    await user.click(screen.getByText('cleanup:all'));
    await user.click(screen.getByLabelText('permissions'));
    await user.click(screen.getByText('all:tags'));
    await user.click(screen.getByLabelText('permissions'));
    await user.click(screen.getByText('all:settings'));
    await user.click(screen.getByLabelText('permissions'));
    await user.click(screen.getByText('operation:all'));
    await user.click(screen.getByLabelText('permissions'));

    expect(screen.getByText('No options')).toBeVisible();
  });

  it('should display individual abilities', async () => {
    const user = userEvent.setup();

    render(
      <AbilitiesMultiSelect
        abilities={[
          { id: 1, name: 'all', resource: 'all' },
          { id: 2, name: 'all', resource: 'users' },
        ]}
        userAbilities={[]}
        setAbilities={noop}
      />
    );

    await user.click(screen.getByLabelText('permissions'));
    expect(screen.getByText('all:all')).toBeVisible();
    expect(screen.getByText('all:users')).toBeVisible();
  });

  it('should preload grouped abilities', async () => {
    const user = userEvent.setup();

    render(
      <AbilitiesMultiSelect
        abilities={[
          { id: 1, name: 'all', resource: 'all' },
          { id: 2, name: 'all', resource: 'host_checks_selection' },
          { id: 3, name: 'all', resource: 'cluster_checks_selection' },
          { id: 4, name: 'saptune_solution_apply', resource: 'host' },
          { id: 5, name: 'saptune_solution_change', resource: 'host' },
          { id: 6, name: 'maintenance_change', resource: 'cluster' },
          { id: 7, name: 'pacemaker_enable', resource: 'cluster' },
          { id: 8, name: 'pacemaker_disable', resource: 'cluster' },
          { id: 9, name: 'start', resource: 'application_instance' },
          { id: 10, name: 'stop', resource: 'application_instance' },
        ]}
        userAbilities={[
          { id: 1, name: 'all', resource: 'all' },
          { id: 2, name: 'all', resource: 'host_checks_selection' },
          { id: 3, name: 'all', resource: 'cluster_checks_selection' },
          { id: 4, name: 'saptune_solution_apply', resource: 'host' },
          { id: 5, name: 'saptune_solution_change', resource: 'host' },
          { id: 6, name: 'maintenance_change', resource: 'cluster' },
          { id: 7, name: 'pacemaker_enable', resource: 'cluster' },
          { id: 8, name: 'pacemaker_disable', resource: 'cluster' },
          { id: 9, name: 'start', resource: 'application_instance' },
          { id: 10, name: 'stop', resource: 'application_instance' },
        ]}
        setAbilities={noop}
        operationsEnabled
      />
    );

    screen.getByText('all:checks_selection');
    screen.getByText('all:all');
    screen.getByText('operation:all');
    expect(
      screen.queryByText('all:host_checks_selection')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('all:cluster_checks_selection')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('saptune_solution_apply:host')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('saptune_solution_change:host')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('maintenance_change:cluster')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('pacemaker_enable:cluster')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('pacemaker_disable:cluster')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('start:application_instance')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('stop:application_instance')
    ).not.toBeInTheDocument();

    await user.click(screen.getByLabelText('permissions'));
    expect(screen.getByText('No options')).toBeVisible();
  });
});
