import React from 'react';
import { act, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import MockAdapter from 'axios-mock-adapter';
import { renderWithRouter } from '@lib/test-utils';

import { networkClient } from '@lib/network';
import { activityLogEntryFactory } from '@lib/test-utils/factories/activityLog';

import ActivityLogPage from './ActivityLogPage';

const axiosMock = new MockAdapter(networkClient);

describe('ActivityLogPage', () => {
  it('should render table without data', async () => {
    axiosMock.onGet('/api/v1/activity_log').reply(200, []);
    await act(async () => renderWithRouter(<ActivityLogPage />));
    expect(screen.getByText('No data available')).toBeVisible();
  });

  it.each`
    responseStatus | responseBody
    ${404}         | ${[]}
    ${500}         | ${{ error: 'Internal Server Error' }}
    ${503}         | ${null}
    ${504}         | ${''}
  `(
    'should render empty activity log on error `$responseStatus`',
    async ({ responseStatus, responseBody }) => {
      axiosMock
        .onGet('/api/v1/activity_log')
        .reply(responseStatus, responseBody);

      await act(() => renderWithRouter(<ActivityLogPage />));

      expect(screen.getByText('No data available')).toBeVisible();
    }
  );

  it('should render tracked activity log', async () => {
    axiosMock
      .onGet('/api/v1/activity_log')
      .reply(200, activityLogEntryFactory.buildList(5));

    const { container } = await act(() =>
      renderWithRouter(<ActivityLogPage />)
    );

    expect(container.querySelectorAll('tbody > tr')).toHaveLength(5);
  });
});
