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
});
