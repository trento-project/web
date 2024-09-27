import React from 'react';
import { faker } from '@faker-js/faker';
import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  activityLogEntryFactory,
  taggingMetadataFactory,
  untaggingMetadataFactory,
} from '@lib/test-utils/factories/activityLog';
import {
  ACTIVITY_TYPES,
  RESOURCE_TAGGING,
  RESOURCE_UNTAGGING,
  toMessage,
} from '@lib/model/activityLog';

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

  const baseScenarios = ACTIVITY_TYPES.map((activityType) => {
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
  });

  const taggingScenarios = [
    {
      name: 'host tagging entry',
      entry: activityLogEntryFactory.build({
        type: RESOURCE_TAGGING,
        metadata: taggingMetadataFactory.build({
          resource_type: 'host',
          added_tag: 'the-added-tag',
          hostname: 'the-hostname',
        }),
      }),
      expectedMessage: 'Tag "the-added-tag" added to Host "the-hostname"',
    },
    {
      name: 'host untagging entry',
      entry: activityLogEntryFactory.build({
        type: RESOURCE_UNTAGGING,
        metadata: untaggingMetadataFactory.build({
          resource_type: 'host',
          removed_tag: 'the-removed-tag',
          hostname: 'the-hostname',
        }),
      }),
      expectedMessage: 'Tag "the-removed-tag" removed from Host "the-hostname"',
    },
    {
      name: 'cluster tagging entry',
      entry: activityLogEntryFactory.build({
        type: RESOURCE_TAGGING,
        metadata: taggingMetadataFactory.build({
          resource_type: 'cluster',
          added_tag: 'the-added-tag',
          name: 'the-clustername',
        }),
      }),
      expectedMessage: 'Tag "the-added-tag" added to Cluster "the-clustername"',
    },
    {
      name: 'cluster untagging entry',
      entry: activityLogEntryFactory.build({
        type: RESOURCE_UNTAGGING,
        metadata: untaggingMetadataFactory.build({
          resource_type: 'cluster',
          removed_tag: 'the-removed-tag',
          name: 'the-clustername',
        }),
      }),
      expectedMessage:
        'Tag "the-removed-tag" removed from Cluster "the-clustername"',
    },
    {
      name: 'database tagging entry',
      entry: activityLogEntryFactory.build({
        type: RESOURCE_TAGGING,
        metadata: taggingMetadataFactory.build({
          resource_type: 'database',
          added_tag: 'the-added-tag',
          sid: 'the-database-sid',
        }),
      }),
      expectedMessage:
        'Tag "the-added-tag" added to Database "the-database-sid"',
    },
    {
      name: 'database untagging entry',
      entry: activityLogEntryFactory.build({
        type: RESOURCE_UNTAGGING,
        metadata: untaggingMetadataFactory.build({
          resource_type: 'database',
          removed_tag: 'the-removed-tag',
          sid: 'the-database-sid',
        }),
      }),
      expectedMessage:
        'Tag "the-removed-tag" removed from Database "the-database-sid"',
    },
    {
      name: 'sap system tagging entry',
      entry: activityLogEntryFactory.build({
        type: RESOURCE_TAGGING,
        metadata: taggingMetadataFactory.build({
          resource_type: 'sap_system',
          added_tag: 'the-added-tag',
          sid: 'the-sap_system-sid',
        }),
      }),
      expectedMessage:
        'Tag "the-added-tag" added to SAP System "the-sap_system-sid"',
    },
    {
      name: 'sap system untagging entry',
      entry: activityLogEntryFactory.build({
        type: RESOURCE_UNTAGGING,
        metadata: untaggingMetadataFactory.build({
          resource_type: 'sap_system',
          removed_tag: 'the-removed-tag',
          sid: 'the-sap_system-sid',
        }),
      }),
      expectedMessage:
        'Tag "the-removed-tag" removed from SAP System "the-sap_system-sid"',
    },
    {
      name: 'unknown resource tagging entry',
      entry: activityLogEntryFactory.build({
        type: RESOURCE_TAGGING,
        metadata: taggingMetadataFactory.build({
          resource_type: 'foo_bar',
          added_tag: 'the-added-tag',
        }),
      }),
      expectedMessage:
        'Tag "the-added-tag" added to .* "unrecognized resource"',
    },
    {
      name: 'unknown resource untagging entry',
      entry: activityLogEntryFactory.build({
        type: RESOURCE_UNTAGGING,
        metadata: untaggingMetadataFactory.build({
          resource_type: 'foo_bar',
          removed_tag: 'the-removed-tag',
        }),
      }),
      expectedMessage:
        'Tag "the-removed-tag" removed from .* "unrecognized resource"',
    },
  ];

  const scenarios = [
    ...baseScenarios,
    ...taggingScenarios,
    {
      name: 'unknown activity type',
      entry: activityLogEntryFactory.build({
        type: 'foo_bar',
      }),
      expectedMessage: 'foo_bar',
    },
  ];

  it.each(scenarios)(
    'should render log entry for activity `$name`',
    ({ entry, expectedUser, expectedMessage, expectedLevel }) => {
      render(<ActivityLogOverview activityLog={[entry]} />);

      expect(screen.getByText(new RegExp(expectedMessage))).toBeVisible();
      expectedUser && expect(screen.getByText(expectedUser)).toBeVisible();
      expectedLevel &&
        expect(
          screen.getByLabelText(`log-level-${expectedLevel}`)
        ).toBeVisible();
    }
  );

  it('should call onActivityLogEntryClick when clicking on an entry in the table', async () => {
    const id = faker.string.uuid();
    const entry = activityLogEntryFactory.build({ id });
    render(<ActivityLogOverview activityLog={[entry]} />);

    await userEvent.click(screen.getByLabelText(`entry-${id}`));

    expect(screen.getByText('Activity Details')).toBeVisible();
    expect(screen.getByText('ID')).toBeVisible();
    expect(screen.getByText(id)).toBeVisible();
  });
});
