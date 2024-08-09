import React from 'react';
import { faker } from '@faker-js/faker';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { activityLogEntryFactory } from '@lib/test-utils/factories/activityLog';
import { ACTIVITY_TYPES, toMessage } from '@lib/model/activityLog';
import '@testing-library/jest-dom';

import ActivityLogOverview from '.';

describe('Activity Log Overview', () => {
  it('should render an empty activity log', () => {
    render(<ActivityLogOverview activityLog={[]} />);

    expect(screen.getByText('No data available')).toBeVisible();
  });

  it('should render a loading activity log', () => {
    render(<ActivityLogOverview activityLog={[]} loading />);

    expect(screen.getByText('Loading...')).toBeVisible();
  });

  const scenarios = ACTIVITY_TYPES.map((activityType) => {
    const entry = activityLogEntryFactory.build({
      type: activityType,
    });
    const { actor, level } = entry;
    return {
      name: activityType,
      entry,
      expectedUser: actor,
      expectedMessage: toMessage(entry),
      expectedLevel: level,
    };
  }).concat({
    name: 'unknown activity type',
    entry: activityLogEntryFactory.build({
      actor: 'user-9',
      type: 'foo_bar',
    }),
    expectedUser: 'user-9',
    expectedMessage: 'foo_bar',
  });

  it.each(scenarios)(
    'should render log entry for activity `$name`',
    ({ entry, expectedUser, expectedMessage, expectedLevel }) => {
      render(<ActivityLogOverview activityLog={[entry]} />);

      expect(screen.getByText(expectedMessage)).toBeVisible();
      expect(screen.getByText(expectedUser)).toBeVisible();
      if (expectedLevel) {
        expect(
          screen.getByLabelText(`log-level-${expectedLevel}`)
        ).toBeVisible();
      }
    }
  );

  it('should call onActivityLogEntryClick when clicking on an entry in the table', async () => {
    const onActivityLogEntryClick = jest.fn();
    const id = faker.string.uuid();
    render(
      <ActivityLogOverview
        activityLog={[activityLogEntryFactory.build({ id })]}
        onActivityLogEntryClick={onActivityLogEntryClick}
      />
    );

    await userEvent.click(screen.getByLabelText(`entry-${id}`));
    expect(onActivityLogEntryClick).toHaveBeenCalled();
  });

  describe('filtering and pagination', () => {
    it('should load the activity log with the default filters', () => {
      const loadActivityLog = jest.fn();
      render(
        <ActivityLogOverview
          activityLog={activityLogEntryFactory.buildList(11)}
          loadActivityLog={loadActivityLog}
        />
      );

      expect(loadActivityLog).toHaveBeenCalledTimes(1);
      expect(loadActivityLog).toHaveBeenCalledWith({
        first: 10,
      });
    });

    it.each`
      name                      | hasNextPage | hasPreviousPage
      ${'only one page'}        | ${false}    | ${false}
      ${'on first page'}        | ${true}     | ${false}
      ${'on intermediate page'} | ${true}     | ${true}
      ${'on last page'}         | ${false}    | ${true}
    `(
      'should allow relevant pagination given the context: $name',
      ({ hasNextPage, hasPreviousPage }) => {
        render(
          <ActivityLogOverview
            activityLog={activityLogEntryFactory.buildList(23)}
            currentPaginationData={{
              first: 7,
              last: null,
              start_cursor: 'start_cursor',
              end_cursor: 'end_cursor',
              has_next_page: hasNextPage,
              has_previous_page: hasPreviousPage,
            }}
          />
        );

        const prevPageButton = screen.getByLabelText('prev-page');
        hasPreviousPage
          ? expect(prevPageButton).toBeEnabled()
          : expect(prevPageButton).toBeDisabled();

        const nextPageButton = screen.getByLabelText('next-page');
        hasNextPage
          ? expect(nextPageButton).toBeEnabled()
          : expect(nextPageButton).toBeDisabled();
      }
    );

    it('should apply new pagination to activity log', async () => {
      const loadActivityLog = jest.fn();

      render(
        <ActivityLogOverview
          activityLog={activityLogEntryFactory.buildList(23)}
          currentPaginationData={{
            first: 7,
            last: null,
            start_cursor: 'start_cursor',
            end_cursor: 'end_cursor',
            has_next_page: true,
            has_previous_page: true,
          }}
          loadActivityLog={loadActivityLog}
        />
      );

      // initial load
      expect(loadActivityLog).toHaveBeenNthCalledWith(1, { first: 10 });

      // change items per page from 10 to 20
      await userEvent.click(screen.getByRole('button', { name: '10' }));
      await userEvent.click(screen.getByRole('option', { name: '20' }));

      // just change the number of items from 10 to 20
      expect(loadActivityLog).toHaveBeenNthCalledWith(2, { first: 20 });

      // navigate to next page
      const nextPageButton = screen.getByLabelText('next-page');
      await userEvent.click(nextPageButton);

      // keep previously selected number of items (20)
      // and look for 20 items after the end cursor (aka the last element in the list)
      expect(loadActivityLog).toHaveBeenNthCalledWith(3, {
        first: 20,
        after: 'end_cursor',
      });

      // change again items per page from 20 to 10
      await userEvent.click(screen.getByRole('button', { name: '20' }));
      await userEvent.click(screen.getByRole('option', { name: '10' }));

      // just change the number of items from 20 to 10 and keep previous cursor
      expect(loadActivityLog).toHaveBeenNthCalledWith(4, {
        first: 10,
        after: 'end_cursor',
      });

      // navigate to previous page
      const prevPageButton = screen.getByLabelText('prev-page');
      await userEvent.click(prevPageButton);

      // keeps the last selected number of items to show (10)
      // and look for 10 items before the start cursor (aka the first element in the list)
      expect(loadActivityLog).toHaveBeenNthCalledWith(5, {
        last: 10,
        before: 'start_cursor',
      });
    });
  });
});
