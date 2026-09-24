// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React, { act } from 'react';
import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { parseDateTimeLocalToUtc } from '@lib/timezones';

import MockAdapter from 'axios-mock-adapter';

import { networkClient } from '@lib/network';
import {
  renderWithRouter,
  withDefaultState,
  withState,
  defaultInitialState,
} from '@lib/test-utils';
import { activityLogEntryFactory } from '@lib/test-utils/factories/activityLog';
import { userFactory } from '@lib/test-utils/factories/users';
import { readViewSetting, writeViewSetting } from '@lib/viewSettings';

import ActivityLogPage from './ActivityLogPage';

const axiosMock = new MockAdapter(networkClient);

describe('ActivityLogPage', () => {
  beforeEach(() => {
    // Restore filter settings
    window.sessionStorage.clear();
  });

  it('should render table without data', async () => {
    axiosMock.onGet('/api/v1/activity_log').reply(200, { data: [] });
    const [StatefulActivityLogPage, _] = withDefaultState(<ActivityLogPage />);
    await act(() => renderWithRouter(StatefulActivityLogPage));
    expect(screen.getByText('No data available')).toBeVisible();
  });

  it('should render filters', async () => {
    const [StatefulActivityLogPage, _] = withDefaultState(<ActivityLogPage />);
    await act(() => renderWithRouter(StatefulActivityLogPage));
    expect(screen.getByText('Filter Type...')).toBeInTheDocument();
    expect(screen.getByText('Filter User...')).toBeInTheDocument();
    expect(screen.getByText('Filter From date...')).toBeInTheDocument();
    expect(screen.getByText('Filter To date...')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Filter by metadata')
    ).toBeInTheDocument();
  });

  it('should render actions', async () => {
    const [StatefulActivityLogPage, _] = withDefaultState(<ActivityLogPage />);
    await act(() => renderWithRouter(StatefulActivityLogPage));
    expect(screen.getByText('Apply Filter')).toBeVisible();
    expect(screen.getByText('Reset Filters')).toBeVisible();
    expect(screen.getByText('Refresh')).toBeVisible();
    // Autorefresh is off by default
    expect(screen.getByText('Off')).toBeVisible();
  });

  it.each`
    responseStatus | responseBody
    ${200}         | ${{ dataz: [] }}
    ${200}         | ${[]}
    ${200}         | ${{}}
    ${200}         | ${{ foo: [] }}
    ${200}         | ${''}
    ${200}         | ${null}
  `(
    'should render empty activity log on responseStatus: `$responseStatus` and responseBody: `$responseBody`',
    async ({ responseStatus, responseBody }) => {
      axiosMock
        .onGet('/api/v1/activity_log')
        .reply(responseStatus, responseBody);
      const [StatefulActivityLogPage, _] = withDefaultState(
        <ActivityLogPage />
      );
      await act(() => renderWithRouter(StatefulActivityLogPage));

      expect(screen.getByText('No data available')).toBeVisible();
    }
  );

  it.each`
    responseStatus | responseBody
    ${404}         | ${[]}
    ${404}         | ${{ data: [] }}
    ${500}         | ${{ error: 'Internal Server Error' }}
    ${503}         | ${null}
    ${504}         | ${''}
  `(
    'should render error screen activity log on responseStatus: `$responseStatus` and responseBody: `$responseBody`',
    async ({ responseStatus, responseBody }) => {
      axiosMock
        .onGet('/api/v1/activity_log')
        .reply(responseStatus, responseBody);
      const [StatefulActivityLogPage, _] = withDefaultState(
        <ActivityLogPage />
      );
      await act(() => renderWithRouter(StatefulActivityLogPage));

      expect(screen.getByText('Connection Error')).toBeVisible();
    }
  );

  it('should render tracked activity log', async () => {
    axiosMock
      .onGet('/api/v1/activity_log')
      .reply(200, { data: activityLogEntryFactory.buildList(5) });
    const [StatefulActivityLogPage, _] = withDefaultState(<ActivityLogPage />);
    const { container } = await act(() =>
      renderWithRouter(StatefulActivityLogPage)
    );
    expect(container.querySelectorAll('tbody > tr')).toHaveLength(5);
  });

  it('should render tracked activity log and the users filter with non-default/non-empty state', async () => {
    const users = userFactory.buildList(5).map((user) => user.username);
    axiosMock
      .onGet('/api/v1/activity_log')
      .reply(200, { data: activityLogEntryFactory.buildList(5) });
    const [StatefulActivityLogPage, _] = withState(<ActivityLogPage />, {
      ...defaultInitialState,
      activityLog: { users },
    });
    const { container } = await act(() =>
      renderWithRouter(StatefulActivityLogPage)
    );

    await userEvent.click(screen.getByTestId('filter-User'));
    expect(container.querySelectorAll('ul > li[role="option"]')).toHaveLength(
      users.length
    );
  });

  describe('Autorefresh', () => {
    it.each`
      isOnFirstPage | isEnabled
      ${true}       | ${true}
      ${false}      | ${false}
    `(
      'should enable selecting autorefresh rate only on first page',
      async ({ isOnFirstPage, isEnabled }) => {
        axiosMock.onGet('/api/v1/activity_log').reply(200, {
          data: activityLogEntryFactory.buildList(10),
          pagination: {
            has_previous_page: !isOnFirstPage,
          },
        });
        const [StatefulActivityLogPage, _] = withDefaultState(
          <ActivityLogPage />
        );
        await act(() => renderWithRouter(StatefulActivityLogPage));

        const autorefreshButton = screen.getByRole('combobox', {
          name: 'refresh-rate',
        });

        isEnabled
          ? expect(autorefreshButton).toBeEnabled()
          : expect(autorefreshButton).toBeDisabled();
      }
    );
  });

  it('should send from_date as timezone-aware ISO when custom date is selected', async () => {
    const user = userEvent.setup();
    const timezone = 'Pacific/Kiritimati';
    const datetime = '2024-08-14T21:00';
    const onGetSpy = jest.spyOn(networkClient, 'get');

    axiosMock.onGet('/api/v1/activity_log').reply(200, { data: [] });

    const [StatefulActivityLogPage] = withState(<ActivityLogPage />, {
      ...defaultInitialState,
      user: {
        ...defaultInitialState.user,
        timezone,
      },
    });

    await act(() => renderWithRouter(StatefulActivityLogPage));

    await user.click(screen.getByText('Filter From date...'));

    const input = document.querySelector('input[type="datetime-local"]');
    await user.click(input);
    await user.clear(input);
    await user.type(input, datetime);
    await user.click(screen.getByText('Apply Filter'));

    const expectedToDate = parseDateTimeLocalToUtc(
      datetime,
      timezone
    ).toISOString();

    expect(onGetSpy).toHaveBeenLastCalledWith(
      '/activity_log',
      expect.objectContaining({
        params: expect.objectContaining({
          from_date: expectedToDate,
        }),
      })
    );

    onGetSpy.mockRestore();
  });

  it('should apply the default severities when the view was never visited', async () => {
    axiosMock.onGet('/api/v1/activity_log').reply(200, { data: [] });
    const [StatefulActivityLogPage] = withDefaultState(<ActivityLogPage />);

    await act(() =>
      renderWithRouter(StatefulActivityLogPage, { route: '/activity_log' })
    );

    await waitFor(() =>
      expect(
        new URLSearchParams(window.location.search).getAll('severity')
      ).toEqual(['info', 'warning', 'critical'])
    );
  });

  it('should restore the stored filters and page size when landing on a bare url', async () => {
    const onGetSpy = jest.spyOn(networkClient, 'get');
    axiosMock.onGet('/api/v1/activity_log').reply(200, { data: [] });

    writeViewSetting('activityLog', 'severity=critical&itemsPerPage=50');

    const [StatefulActivityLogPage] = withDefaultState(<ActivityLogPage />);

    await act(() =>
      renderWithRouter(StatefulActivityLogPage, { route: '/activity_log' })
    );

    await waitFor(() => {
      const params = new URLSearchParams(window.location.search);

      expect(params.getAll('severity')).toEqual(['critical']);
      expect(params.get('itemsPerPage')).toEqual('50');
      expect(params.has('first')).toBe(false);
      expect(params.has('last')).toBe(false);
    });

    expect(onGetSpy).toHaveBeenLastCalledWith(
      '/activity_log',
      expect.objectContaining({
        params: expect.objectContaining({
          severity: ['critical'],
          first: 50,
        }),
      })
    );

    onGetSpy.mockRestore();
  });

  it('should use itemsPerPage over a mismatching first/last in the api call', async () => {
    const onGetSpy = jest.spyOn(networkClient, 'get');
    axiosMock.onGet('/api/v1/activity_log').reply(200, { data: [] });

    const [StatefulActivityLogPage] = withDefaultState(<ActivityLogPage />);

    await act(() =>
      renderWithRouter(StatefulActivityLogPage, {
        route: '/activity_log?itemsPerPage=20&first=50',
      })
    );

    await waitFor(() =>
      expect(onGetSpy).toHaveBeenLastCalledWith(
        '/activity_log',
        expect.objectContaining({
          params: expect.objectContaining({ first: 20 }),
        })
      )
    );

    onGetSpy.mockRestore();
  });

  it('should let the filters in the url win over the stored ones', async () => {
    axiosMock.onGet('/api/v1/activity_log').reply(200, { data: [] });

    writeViewSetting('activityLog', 'severity=critical');

    const [StatefulActivityLogPage] = withDefaultState(<ActivityLogPage />);

    await act(() =>
      renderWithRouter(StatefulActivityLogPage, {
        route: '/activity_log?severity=debug',
      })
    );

    expect(
      new URLSearchParams(window.location.search).getAll('severity')
    ).toEqual(['debug']);

    await waitFor(() =>
      expect(readViewSetting('activityLog')).toEqual('severity=debug')
    );
  });

  it('should store the selected filters, without the free text search', async () => {
    const user = userEvent.setup();
    const users = userFactory.buildList(5).map(({ username }) => username);
    axiosMock.onGet('/api/v1/activity_log').reply(200, { data: [] });

    const [StatefulActivityLogPage] = withState(<ActivityLogPage />, {
      ...defaultInitialState,
      activityLog: { users },
    });

    await act(() =>
      renderWithRouter(StatefulActivityLogPage, { route: '/activity_log' })
    );

    await user.type(
      screen.getByPlaceholderText('Filter by metadata'),
      'some metadata'
    );
    await user.click(screen.getByTestId('filter-User'));
    await user.click(screen.getByText(users[0]));
    await user.click(screen.getByText('Apply Filter'));

    await waitFor(() => {
      const stored = new URLSearchParams(readViewSetting('activityLog'));

      expect(stored.get('actor')).toEqual(users[0]);
      expect(stored.getAll('severity')).toEqual([
        'info',
        'warning',
        'critical',
      ]);
      expect(stored.has('search')).toBe(false);
    });
  });

  it('should store the selected items per page', async () => {
    const user = userEvent.setup();
    axiosMock.onGet('/api/v1/activity_log').reply(200, { data: [] });

    const [StatefulActivityLogPage] = withDefaultState(<ActivityLogPage />);

    await act(() =>
      renderWithRouter(StatefulActivityLogPage, { route: '/activity_log' })
    );

    await user.click(screen.getByRole('combobox', { name: 'per-page' }));
    await user.click(screen.getByRole('option', { name: '50' }));

    await waitFor(() =>
      expect(
        new URLSearchParams(readViewSetting('activityLog')).get('itemsPerPage')
      ).toEqual('50')
    );
  });

  it('should persist the items per page value', async () => {
    const user = userEvent.setup();
    axiosMock.onGet('/api/v1/activity_log').reply(200, {
      data: [],
      pagination: { has_next_page: true, end_cursor: 'some-cursor' },
    });

    const [StatefulActivityLogPage] = withDefaultState(<ActivityLogPage />);

    await act(() =>
      renderWithRouter(StatefulActivityLogPage, { route: '/activity_log' })
    );

    await user.click(screen.getByRole('button', { name: 'next-page' }));

    await waitFor(() => {
      const stored = new URLSearchParams(readViewSetting('activityLog'));

      expect(stored.has('first')).toBe(false);
      expect(stored.has('after')).toBe(false);
      expect(stored.get('itemsPerPage')).toEqual('20');
    });
  });
});
