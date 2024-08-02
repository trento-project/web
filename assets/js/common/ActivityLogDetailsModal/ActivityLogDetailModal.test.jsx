import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { faker } from '@faker-js/faker';
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
  LEVEL_WARNING,
} from '@lib/model/activityLog';
import { toRenderedEntry } from '@common/ActivityLogOverview/ActivityLogOverview';
import ActivityLogDetailModal from '.';

describe('ActivityLogDetailModal component', () => {
  const scenarios = [
    {
      name: LOGIN_ATTEMPT,
      entry: activityLogEntryFactory.build({
        type: LOGIN_ATTEMPT,
        metadata: {},
      }),
      expectedActivityType: 'Login Attempt',
      expectedResource: 'Application',
    },
    {
      name: RESOURCE_TAGGING,
      entry: activityLogEntryFactory.build({
        type: RESOURCE_TAGGING,
        metadata: taggingMetadataFactory.build({
          resource_type: 'host',
        }),
      }),
      expectedActivityType: 'Tag Added',
      expectedResource: 'Host',
    },
    {
      name: RESOURCE_UNTAGGING,
      entry: activityLogEntryFactory.build({
        type: RESOURCE_UNTAGGING,
        level: LEVEL_WARNING,
        metadata: untaggingMetadataFactory.build({
          resource_type: 'cluster',
        }),
      }),
      expectedActivityType: 'Tag Removed',
      expectedResource: 'Cluster',
    },
    {
      name: API_KEY_GENERATION,
      entry: activityLogEntryFactory.build({
        type: API_KEY_GENERATION,
      }),
      expectedActivityType: 'API Key Generated',
      expectedResource: 'API Key',
    },
    {
      name: SAVING_SUMA_SETTINGS,
      entry: activityLogEntryFactory.build({
        type: SAVING_SUMA_SETTINGS,
      }),
      expectedActivityType: 'SUMA Settings Saved',
      expectedResource: 'SUMA Settings',
    },
    {
      name: CHANGING_SUMA_SETTINGS,
      entry: activityLogEntryFactory.build({
        type: CHANGING_SUMA_SETTINGS,
      }),
      expectedActivityType: 'SUMA Settings Changed',
      expectedResource: 'SUMA Settings',
    },
    {
      name: CLEARING_SUMA_SETTINGS,
      entry: activityLogEntryFactory.build({
        type: CLEARING_SUMA_SETTINGS,
      }),
      expectedActivityType: 'SUMA Settings Cleared',
      expectedResource: 'SUMA Settings',
    },
    {
      name: USER_CREATION,
      entry: activityLogEntryFactory.build({
        type: USER_CREATION,
      }),
      expectedActivityType: 'User Created',
      expectedResource: 'User',
      userRelatedActivity: true,
    },
    {
      name: USER_MODIFICATION,
      entry: activityLogEntryFactory.build({
        type: USER_MODIFICATION,
      }),
      expectedActivityType: 'User Modified',
      expectedResource: 'User',
      userRelatedActivity: true,
    },
    {
      name: USER_DELETION,
      entry: activityLogEntryFactory.build({
        type: USER_DELETION,
      }),
      expectedActivityType: 'User Deleted',
      expectedResource: 'User',
      userRelatedActivity: true,
    },
    {
      name: PROFILE_UPDATE,
      entry: activityLogEntryFactory.build({
        type: PROFILE_UPDATE,
      }),
      expectedActivityType: 'Profile Updated',
      expectedResource: 'Profile',
    },
    {
      name: CLUSTER_CHECKS_EXECUTION_REQUEST,
      entry: activityLogEntryFactory.build({
        type: CLUSTER_CHECKS_EXECUTION_REQUEST,
      }),
      expectedActivityType: 'Checks Execution Requested',
      expectedResource: 'Cluster',
    },
  ];

  it.each(scenarios)(
    'should render detail for activity entry `$name`',
    async ({
      entry,
      expectedActivityType,
      expectedResource,
      userRelatedActivity = false,
    }) => {
      const { id } = entry;
      await act(async () => {
        render(<ActivityLogDetailModal open entry={toRenderedEntry(entry)} />);
      });

      expect(screen.getByText('ID')).toBeVisible();
      expect(screen.getByText(id)).toBeVisible();

      expect(screen.getByText('Activity Type')).toBeVisible();
      expect(screen.getByText(expectedActivityType)).toBeVisible();

      expect(screen.getByText('Resource')).toBeVisible();
      const resource = screen.getByLabelText('activity-log-resource');
      expect(resource).toBeVisible();
      expect(resource).toHaveTextContent(expectedResource);

      const userReferences = screen.getAllByText('User');
      if (userRelatedActivity) {
        expect(userReferences).toHaveLength(2);
      }
      userReferences.forEach((userReference) => {
        expect(userReference).toBeVisible();
      });

      expect(screen.getByText('Message')).toBeVisible();
      expect(screen.getByText('Created at')).toBeVisible();
    }
  );

  it('should render detail for unknown activity type', async () => {
    const unknownActivityType = faker.lorem.word();
    const entry = activityLogEntryFactory.build({ type: unknownActivityType });
    await act(async () => {
      render(<ActivityLogDetailModal open entry={toRenderedEntry(entry)} />);
    });

    const activityReferences = screen.getAllByText(unknownActivityType);
    expect(activityReferences).toHaveLength(2);
    activityReferences.forEach((activityReference) => {
      expect(activityReference).toBeVisible();
    });

    expect(screen.getByText('Unrecognized resource')).toBeVisible();
  });

  it('should call onClose when the close button is clicked', async () => {
    const onClose = jest.fn();
    await act(async () => {
      render(
        <ActivityLogDetailModal
          open
          entry={activityLogEntryFactory.build()}
          onClose={onClose}
        />
      );
    });

    await userEvent.click(screen.getByText('Close'));
    expect(onClose).toHaveBeenCalled();
  });
});
