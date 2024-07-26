import React from 'react';
import { faker } from '@faker-js/faker';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  activityLogEntryFactory,
  taggingMetadataFactory,
  untaggingMetadataFactory,
} from '@lib/test-utils/factories/activityLog';
import {
  LOGIN_ATTEMPT,
  RESOURCE_TAGGING,
  RESOURCE_UNTAGGING,
  API_KEY_GENERATION,
  CHANGING_SUMA_SETTINGS,
  CLEARING_SUMA_SETTINGS,
  SAVING_SUMA_SETTINGS,
  CLUSTER_CHECKS_EXECUTION_REQUEST,
  PROFILE_UPDATE,
  USER_CREATION,
  USER_DELETION,
  USER_MODIFICATION,
  LEVEL_DEBUG,
  LEVEL_ERROR,
  LEVEL_INFO,
  LEVEL_WARNING,
} from '@lib/model/activityLog';
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

  const scenarios = [
    {
      name: LOGIN_ATTEMPT,
      entry: activityLogEntryFactory.build({
        actor: 'admin',
        type: LOGIN_ATTEMPT,
        level: LEVEL_DEBUG,
        metadata: {},
      }),
      expectedUser: 'admin',
      expectedMessage: 'User logged in',
      expectedLevel: 'debug',
    },
    {
      name: RESOURCE_TAGGING,
      entry: activityLogEntryFactory.build({
        actor: 'foo',
        type: RESOURCE_TAGGING,
        level: LEVEL_INFO,
        metadata: taggingMetadataFactory.build({
          resource_type: 'host',
          added_tag: 'bar',
          resource_id: 'foo-bar',
        }),
      }),
      expectedUser: 'foo',
      expectedMessage: 'Tag "bar" added to "foo-bar"',
      expectedLevel: 'info',
    },
    {
      name: RESOURCE_UNTAGGING,
      entry: activityLogEntryFactory.build({
        actor: 'bar',
        type: RESOURCE_UNTAGGING,
        level: LEVEL_WARNING,
        metadata: untaggingMetadataFactory.build({
          resource_type: 'cluster',
          removed_tag: 'foo',
          resource_id: 'bar-foo',
        }),
      }),
      expectedUser: 'bar',
      expectedMessage: 'Tag "foo" removed from "bar-foo"',
      expectedLevel: 'warning',
    },
    {
      name: API_KEY_GENERATION,
      entry: activityLogEntryFactory.build({
        actor: 'baz',
        type: API_KEY_GENERATION,
        level: LEVEL_ERROR,
      }),
      expectedUser: 'baz',
      expectedMessage: 'API Key was generated',
      expectedLevel: 'error',
    },
    {
      name: SAVING_SUMA_SETTINGS,
      entry: activityLogEntryFactory.build({
        actor: 'user-1',
        type: SAVING_SUMA_SETTINGS,
      }),
      expectedUser: 'user-1',
      expectedMessage: 'SUMA Settings was saved',
    },
    {
      name: CHANGING_SUMA_SETTINGS,
      entry: activityLogEntryFactory.build({
        actor: 'user-2',
        type: CHANGING_SUMA_SETTINGS,
      }),
      expectedUser: 'user-2',
      expectedMessage: 'SUMA Settings was changed',
    },
    {
      name: CLEARING_SUMA_SETTINGS,
      entry: activityLogEntryFactory.build({
        actor: 'user-3',
        type: CLEARING_SUMA_SETTINGS,
      }),
      expectedUser: 'user-3',
      expectedMessage: 'SUMA Settings was cleared',
    },
    {
      name: USER_CREATION,
      entry: activityLogEntryFactory.build({
        actor: 'user-4',
        type: USER_CREATION,
      }),
      expectedUser: 'user-4',
      expectedMessage: 'User was created',
    },
    {
      name: USER_MODIFICATION,
      entry: activityLogEntryFactory.build({
        actor: 'user-5',
        type: USER_MODIFICATION,
      }),
      expectedUser: 'user-5',
      expectedMessage: 'User was modified',
    },
    {
      name: USER_DELETION,
      entry: activityLogEntryFactory.build({
        actor: 'user-6',
        type: USER_DELETION,
      }),
      expectedUser: 'user-6',
      expectedMessage: 'User was deleted',
    },
    {
      name: PROFILE_UPDATE,
      entry: activityLogEntryFactory.build({
        actor: 'user-7',
        type: PROFILE_UPDATE,
      }),
      expectedUser: 'user-7',
      expectedMessage: 'User modified profile',
    },
    {
      name: CLUSTER_CHECKS_EXECUTION_REQUEST,
      entry: activityLogEntryFactory.build({
        actor: 'user-8',
        type: CLUSTER_CHECKS_EXECUTION_REQUEST,
      }),
      expectedUser: 'user-8',
      expectedMessage: 'Checks execution requested for cluster',
    },
    {
      name: 'unknown activity type',
      entry: activityLogEntryFactory.build({
        actor: 'user-9',
        type: 'foo_bar',
      }),
      expectedUser: 'user-9',
      expectedMessage: 'foo_bar',
    },
  ];

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
