import React from 'react';
import { faker } from '@faker-js/faker';
import { MemoryRouter } from 'react-router-dom';

import PageHeader from '@common/PageHeader';
import BackButton from '@common/BackButton';
import ChecksSelectionHeader from './ChecksSelectionHeader';

export default {
  title: 'Patterns/ChecksSelectionHeader',
  component: ChecksSelectionHeader,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  argTypes: {
    targetID: {
      control: 'text',
      description: 'The target identifier',
      table: {
        type: { summary: 'string' },
      },
    },
    targetName: {
      control: 'text',
      description: 'The target name',
      table: {
        type: { summary: 'string' },
      },
    },
    backTo: {
      description:
        'A Component that renders the back button to the target details',
    },
    pageHeader: {
      description:
        'A Component that renders the page header for the specific target',
    },
    selection: {
      control: 'array',
      description: 'The check selection currently displayed',
    },
    userAbilities: {
      control: 'array',
      description: 'Current user abilities',
    },
    checkSelectionPermittedFor: {
      control: 'array',
      description: 'Abilities that allow check selection',
    },
    savedSelection: {
      control: 'array',
      description: 'The last saved check selection for the target',
    },
    isSavingSelection: {
      control: 'boolean',
      description:
        'Whether Save Checks Selection button is enabled or disabled',
      table: {
        type: { summary: 'boolean' },
      },
    },
    onSaveSelection: {
      description: 'Updates the selected checks on save',
      table: {
        type: { summary: 'function' },
      },
    },
    onStartExecution: {
      description: 'Starts the host checks execution',
      table: {
        type: { summary: 'function' },
      },
    },
  },
};

const targetID = faker.string.uuid();
const targetName = faker.lorem.word(7);
const selection = [faker.string.uuid()];
const savedSelection = [faker.string.uuid()];

export const Default = {
  args: {
    targetID,
    targetName,
    backTo: (
      <BackButton url={`/target/${targetID}`}>
        Back to Target Details
      </BackButton>
    ),
    pageHeader: (
      <PageHeader>
        Target Settings for <span className="font-bold">{targetName}</span>
      </PageHeader>
    ),
    selection,
    userAbilities: [{ name: 'all', resource: 'all' }],
    checkSelectionPermittedFor: ['all:cluster_checks_selection'],
    savedSelection,
    isSavingSelection: false,
  },
};

export const ClusterChecksSelection = {
  args: {
    ...Default.args,
    backTo: (
      <BackButton url={`/clusters/${targetID}`}>
        Back to Cluster Details
      </BackButton>
    ),
    pageHeader: (
      <PageHeader>
        Cluster Settings for <span className="font-bold">{targetName}</span>
      </PageHeader>
    ),
  },
};

export const HostChecksSelection = {
  args: {
    ...Default.args,
    backTo: (
      <BackButton url={`/hosts/${targetID}`}>Back to Host Details</BackButton>
    ),
    pageHeader: (
      <PageHeader>
        Check Settings for <span className="font-bold">{targetName}</span>
      </PageHeader>
    ),
  },
};

export const SavedSelectionDisabled = {
  args: {
    ...Default.args,
    isSavingSelection: true,
  },
};

export const CannotStartExecution = {
  args: {
    ...Default.args,
    savedSelection: [],
    isSavingSelection: false,
  },
};

export const CheckSelectionForbidden = {
  args: {
    ...Default.args,
    userAbilities: [],
  },
};
