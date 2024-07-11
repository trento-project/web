import React from 'react';
import { render, screen } from '@testing-library/react';
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
} from '@lib/model/activityLog';
import '@testing-library/jest-dom';

import ActivityLogOverview from '.';

describe('Activity Log Overview', () => {
  it('should render an empty activity log', () => {
    render(<ActivityLogOverview activityLog={[]} />);

    expect(screen.getByText('No data available')).toBeVisible();
  });

  const scenarios = [
    {
      name: LOGIN_ATTEMPT,
      entry: activityLogEntryFactory.build({
        actor: 'admin',
        type: LOGIN_ATTEMPT,
      }),
      expectedEventType: 'Login Attempt',
      expectedResource: 'Application',
      expectedUser: 'admin',
    },
    {
      name: RESOURCE_TAGGING,
      entry: activityLogEntryFactory.build({
        actor: 'foo',
        type: RESOURCE_TAGGING,
        metadata: taggingMetadataFactory.build({
          resource_type: 'host',
        }),
      }),
      expectedEventType: 'Tag Added',
      expectedResource: 'Host',
      expectedUser: 'foo',
    },
    {
      name: RESOURCE_UNTAGGING,
      entry: activityLogEntryFactory.build({
        actor: 'bar',
        type: RESOURCE_UNTAGGING,
        metadata: untaggingMetadataFactory.build({
          resource_type: 'cluster',
        }),
      }),
      expectedEventType: 'Tag Removed',
      expectedResource: 'Cluster',
      expectedUser: 'bar',
    },
    {
      name: API_KEY_GENERATION,
      entry: activityLogEntryFactory.build({
        actor: 'baz',
        type: API_KEY_GENERATION,
      }),
      expectedEventType: 'API Key Generated',
      expectedResource: 'API Key',
      expectedUser: 'baz',
    },
    {
      name: SAVING_SUMA_SETTINGS,
      entry: activityLogEntryFactory.build({
        actor: 'user-1',
        type: SAVING_SUMA_SETTINGS,
      }),
      expectedEventType: 'SUMA Settings Saved',
      expectedResource: 'SUMA Settings',
      expectedUser: 'user-1',
    },
    {
      name: CHANGING_SUMA_SETTINGS,
      entry: activityLogEntryFactory.build({
        actor: 'user-2',
        type: CHANGING_SUMA_SETTINGS,
      }),
      expectedEventType: 'SUMA Settings Changed',
      expectedResource: 'SUMA Settings',
      expectedUser: 'user-2',
    },
    {
      name: CLEARING_SUMA_SETTINGS,
      entry: activityLogEntryFactory.build({
        actor: 'user-3',
        type: CLEARING_SUMA_SETTINGS,
      }),
      expectedEventType: 'SUMA Settings Cleared',
      expectedResource: 'SUMA Settings',
      expectedUser: 'user-3',
    },
    {
      name: USER_CREATION,
      entry: activityLogEntryFactory.build({
        actor: 'user-4',
        type: USER_CREATION,
      }),
      expectedEventType: 'User Created',
      expectedResource: 'User',
      expectedUser: 'user-4',
    },
    {
      name: USER_MODIFICATION,
      entry: activityLogEntryFactory.build({
        actor: 'user-5',
        type: USER_MODIFICATION,
      }),
      expectedEventType: 'User Modified',
      expectedResource: 'User',
      expectedUser: 'user-5',
    },
    {
      name: USER_DELETION,
      entry: activityLogEntryFactory.build({
        actor: 'user-6',
        type: USER_DELETION,
      }),
      expectedEventType: 'User Deleted',
      expectedResource: 'User',
      expectedUser: 'user-6',
    },
    {
      name: PROFILE_UPDATE,
      entry: activityLogEntryFactory.build({
        actor: 'user-7',
        type: PROFILE_UPDATE,
      }),
      expectedEventType: 'Profile Updated',
      expectedResource: 'Profile',
      expectedUser: 'user-7',
    },
    {
      name: CLUSTER_CHECKS_EXECUTION_REQUEST,
      entry: activityLogEntryFactory.build({
        actor: 'user-8',
        type: CLUSTER_CHECKS_EXECUTION_REQUEST,
      }),
      expectedEventType: 'Checks Execution Requested',
      expectedResource: 'Cluster Checks',
      expectedUser: 'user-8',
    },
  ];

  it.each(scenarios)(
    'should render log entry for activity `$name`',
    ({ entry, expectedEventType, expectedResource, expectedUser }) => {
      render(<ActivityLogOverview activityLog={[entry]} />);

      const eventType = screen.getByLabelText('activity-log-type');
      expect(eventType).toBeVisible();
      expect(eventType).toHaveTextContent(expectedEventType);

      const resource = screen.getByLabelText('activity-log-resource');
      expect(resource).toBeVisible();
      expect(resource).toHaveTextContent(expectedResource);

      expect(screen.getByText(expectedUser)).toBeVisible();
    }
  );
});
