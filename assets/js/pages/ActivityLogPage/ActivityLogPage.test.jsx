import '@testing-library/jest-dom';

import { networkClient } from '@lib/network';
import { renderWithRouter, withDefaultState, withState } from '@lib/test-utils';
import { activityLogEntryFactory } from '@lib/test-utils/factories/activityLog';
import { userFactory } from '@lib/test-utils/factories/users';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockAdapter from 'axios-mock-adapter';
import React, { act } from 'react';

import ActivityLogPage from './ActivityLogPage';

const axiosMock = new MockAdapter(networkClient);

describe('ActivityLogPage', () => {
  it('should render table without data', async () => {
    axiosMock.onGet('/api/v1/activity_log').reply(200, { data: [] });
    const [StatefulActivityLogPage, _] = withDefaultState(<ActivityLogPage />);
    await act(() => renderWithRouter(StatefulActivityLogPage));
    expect(screen.getByText('No data available')).toBeVisible();
  });

  it.each`
    responseStatus | responseBody
    ${200}         | ${{ dataz: [] }}
    ${200}         | ${[]}
    ${200}         | ${{}}
    ${200}         | ${{ foo: [] }}
    ${200}         | ${''}
    ${200}         | ${null}
    ${404}         | ${[]}
    ${404}         | ${{ data: [] }}
    ${500}         | ${{ error: 'Internal Server Error' }}
    ${503}         | ${null}
    ${504}         | ${''}
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
    axiosMock.onGet('/api/v1/activity_log');
    const [StatefulActivityLogPage, _] = withState(<ActivityLogPage />, {
      activityLog: { users },
    });
    const { container } = await act(() =>
      renderWithRouter(StatefulActivityLogPage)
    );

    await userEvent.click(screen.getByTestId('filter-User'));
    expect(container.querySelectorAll('ul > li')).toHaveLength(users.length);
  });
});
