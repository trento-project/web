// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { withState, defaultInitialState } from '@lib/test-utils';
import { networkClient } from '@lib/network';
import MockAdapter from 'axios-mock-adapter';

import { fetchChecksFrequencySettings } from '@state/checksFrequencySettings';
import {
  fetchChecksSchedule,
  setChecksScheduleErrors,
  setEditingChecksSchedule,
  updateChecksSchedule,
} from '@state/checksSchedules';

import TargetChecksFrequency from './TargetChecksFrequency';

const axiosMock = new MockAdapter(networkClient);

const adminAbilities = [{ name: 'all', resource: 'all' }];

const host = { targetType: 'host', targetID: 'host-1' };

const systemSettings = {
  enabled: true,
  frequency: { value: 5, unit: 'minute' },
  enforced_from_env: false,
};

const globalSchedule = {
  enabled: true,
  frequency: { value: 5, unit: 'minute' },
  global: true,
  next_execution_at: null,
};

const ownSchedule = {
  enabled: true,
  frequency: { value: 6, unit: 'hour' },
  global: false,
  next_execution_at: null,
};

const entry = (changes) => ({
  loading: false,
  data: ownSchedule,
  networkError: false,
  editing: false,
  errors: [],
  ...changes,
});

const stateWith = ({ schedule, global = {} } = {}) => ({
  ...defaultInitialState,
  checksSchedules: {
    host: schedule ? { [host.targetID]: schedule } : {},
    cluster: {},
  },
  checksFrequencySettings: {
    ...defaultInitialState.checksFrequencySettings,
    settings: systemSettings,
    ...global,
  },
});

const renderContainer = async (state, target = host) => {
  const [StatefulContainer, store] = withState(
    <TargetChecksFrequency {...target} userAbilities={adminAbilities} />,
    state
  );
  await act(() => render(StatefulContainer));
  return store;
};

describe('TargetChecksFrequency', () => {
  it.each([
    { targetType: 'host', targetID: 'host-1' },
    { targetType: 'cluster', targetID: 'cluster-1' },
  ])(
    'should fetch the schedule of a $targetType and the system settings',
    async (target) => {
      const store = await renderContainer(stateWith(), target);

      expect(store.getActions()).toEqual([
        fetchChecksSchedule(target),
        fetchChecksFrequencySettings(),
      ]);
    }
  );

  it.each`
    case                         | state
    ${'schedule not loaded'}     | ${stateWith()}
    ${'schedule loading'}        | ${stateWith({ schedule: entry({ loading: true, data: null }) })}
    ${'schedule without data'}   | ${stateWith({ schedule: entry({ data: null }) })}
    ${'system settings loading'} | ${stateWith({ schedule: entry(), global: { loading: true } })}
  `('should show the loading state ($case)', async ({ state }) => {
    await renderContainer(state);

    expect(
      screen.getByText('Loading Host Check Executions Settings...')
    ).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Edit Settings' })
    ).not.toBeInTheDocument();
  });

  it('should keep the card on display while saving', async () => {
    await renderContainer(
      stateWith({ schedule: entry({ loading: true, editing: true }) })
    );

    expect(screen.getByLabelText('checks-frequency')).toHaveTextContent(
      'Every 6 hours'
    );
    expect(
      screen.queryByText('Loading Host Check Executions Settings...')
    ).not.toBeInTheDocument();
  });

  it('should close the settings when leaving the target', async () => {
    const [StatefulContainer, store] = withState(
      <TargetChecksFrequency {...host} userAbilities={adminAbilities} />,
      stateWith({ schedule: entry({ editing: true }) })
    );
    let view;
    await act(() => {
      view = render(StatefulContainer);
    });

    store.clearActions();
    view.unmount();

    expect(store.getActions()).toEqual([
      setEditingChecksSchedule({ ...host, editing: false }),
    ]);
  });

  it('should close the settings of the previous target', async () => {
    const [StatefulContainer, store] = withState(
      <TargetChecksFrequency {...host} userAbilities={adminAbilities} />,
      stateWith({ schedule: entry({ editing: true }) })
    );
    let view;
    await act(() => {
      view = render(StatefulContainer);
    });

    store.clearActions();
    await act(() =>
      view.rerender(
        <Provider store={store}>
          <TargetChecksFrequency
            targetType="host"
            targetID="host-2"
            userAbilities={adminAbilities}
          />
        </Provider>
      )
    );

    expect(store.getActions()).toEqual([
      setEditingChecksSchedule({ ...host, editing: false }),
      fetchChecksSchedule({ targetType: 'host', targetID: 'host-2' }),
      fetchChecksFrequencySettings(),
    ]);
  });

  it.each`
    case                               | state
    ${'schedule network error'}        | ${stateWith({ schedule: entry({ networkError: true }) })}
    ${'first load failed'}             | ${stateWith({ schedule: entry({ networkError: true, data: null }) })}
    ${'system settings network error'} | ${stateWith({ schedule: entry(), global: { networkError: true } })}
  `('should retry a failed load ($case)', async ({ state }) => {
    const user = userEvent.setup();
    const store = await renderContainer(state);

    expect(
      screen.getByText(
        'Unable to load Host Check Executions Settings. Please try reloading this section.'
      )
    ).toBeVisible();

    store.clearActions();
    await user.click(screen.getByRole('button', { name: 'Reload' }));

    expect(store.getActions()).toEqual([
      fetchChecksSchedule(host),
      fetchChecksFrequencySettings(),
    ]);
  });

  it('should show the frequency of the target next to the system setting', async () => {
    await renderContainer(stateWith({ schedule: entry() }));

    expect(
      screen.getByRole('heading', { name: 'Host Check Executions' })
    ).toBeVisible();
    expect(screen.getByLabelText('checks-frequency')).toHaveTextContent(
      'Every 6 hours'
    );
    expect(screen.getByLabelText('checks-frequency-source')).toHaveTextContent(
      'Overrides the system setting (Every 5 mins)'
    );
  });

  it('should open the settings', async () => {
    const user = userEvent.setup();
    const store = await renderContainer(stateWith({ schedule: entry() }));

    store.clearActions();
    await user.click(screen.getByRole('button', { name: 'Edit Settings' }));

    expect(store.getActions()).toEqual([
      setChecksScheduleErrors({ ...host, errors: [] }),
      setEditingChecksSchedule({ ...host, editing: true }),
    ]);
  });

  it('should go back to the system setting', async () => {
    const user = userEvent.setup();
    const store = await renderContainer(
      stateWith({ schedule: entry({ data: globalSchedule, editing: true }) })
    );

    expect(
      screen.getByRole('switch', { name: 'Use system setting' })
    ).toBeChecked();

    store.clearActions();
    await user.click(screen.getByRole('button', { name: 'Save Settings' }));

    expect(store.getActions()).toEqual([
      updateChecksSchedule({ ...host, schedule: null }),
    ]);
  });

  it('should save the own settings of the target', async () => {
    const user = userEvent.setup();
    const store = await renderContainer(
      stateWith({ schedule: entry({ editing: true }) })
    );

    expect(
      screen.getByRole('switch', { name: 'Use system setting' })
    ).not.toBeChecked();
    expect(screen.getByText('6')).toBeVisible();
    expect(screen.getByText('Hours')).toBeVisible();

    store.clearActions();
    await user.click(screen.getByRole('button', { name: 'Save Settings' }));

    expect(store.getActions()).toEqual([
      updateChecksSchedule({
        ...host,
        schedule: { enabled: true, frequency: { value: 6, unit: 'hour' } },
      }),
    ]);
  });

  it('should show the errors of a refused change', async () => {
    await renderContainer(
      stateWith({
        schedule: entry({
          editing: true,
          errors: [
            {
              detail: 'must be one of 1, 6, 12, 24',
              source: { pointer: '/frequency/value' },
            },
          ],
        }),
      })
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Must be one of 1, 6, 12, 24'
    );
  });

  it('should not save while saving', async () => {
    await renderContainer(
      stateWith({ schedule: entry({ editing: true, loading: true }) })
    );

    expect(
      screen.getByRole('button', { name: 'Save Settings' })
    ).toBeDisabled();
  });

  it('should close the settings', async () => {
    const user = userEvent.setup();
    const store = await renderContainer(
      stateWith({ schedule: entry({ editing: true }) })
    );

    store.clearActions();
    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(store.getActions()).toEqual([
      setChecksScheduleErrors({ ...host, errors: [] }),
      setEditingChecksSchedule({ ...host, editing: false }),
    ]);
  });

  describe('with the application store', () => {
    afterEach(() => {
      axiosMock.reset();
    });

    it.each`
      case                | schedule          | useSystemSetting | value  | unit
      ${'own settings'}   | ${ownSchedule}    | ${false}         | ${'6'} | ${'Hours'}
      ${'system setting'} | ${globalSchedule} | ${true}          | ${'5'} | ${'Minutes'}
    `(
      'should edit the schedule loaded after the first render ($case)',
      async ({ schedule, useSystemSetting, value, unit }) => {
        const user = userEvent.setup();
        axiosMock.onGet('/hosts/host-1/checks/schedule').reply(200, schedule);
        axiosMock
          .onGet('/settings/checks_frequency')
          .reply(200, systemSettings);

        const [StatefulContainer] = withState(
          <TargetChecksFrequency {...host} userAbilities={adminAbilities} />,
          defaultInitialState,
          true
        );
        await act(() => render(StatefulContainer));

        await user.click(
          await screen.findByRole('button', { name: 'Edit Settings' })
        );

        const systemSettingSwitch = screen.getByRole('switch', {
          name: 'Use system setting',
        });
        if (useSystemSetting) {
          expect(systemSettingSwitch).toBeChecked();
        } else {
          expect(systemSettingSwitch).not.toBeChecked();
        }
        expect(screen.getByText(value)).toBeVisible();
        expect(screen.getByText(unit)).toBeVisible();
      }
    );
  });
});
