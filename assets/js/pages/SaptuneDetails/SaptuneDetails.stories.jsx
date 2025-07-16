import React from 'react';
import { MemoryRouter } from 'react-router';

import { hostFactory, saptuneStatusFactory } from '@lib/test-utils/factories';

import SaptuneDetails from './SaptuneDetails';

const { hostname, id: hostID } = hostFactory.build();
const {
  applied_notes: appliedNotes,
  applied_solution: appliedSolution,
  configured_version: configuredVersion,
  enabled_solution: enabledSolution,
  enabled_notes: enabledNotes,
  package_version: packageVersion,
  services,
  staging,
  tuning_state: tuningState,
} = saptuneStatusFactory.build();

function ContainerWrapper({ children }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">{children}</div>
  );
}

export default {
  title: 'Layouts/SaptuneDetails',
  component: SaptuneDetails,
  argTypes: {
    appliedNotes: {
      control: 'array',
      description: 'Applied notes',
    },
    appliedSolution: {
      control: 'array',
      description: 'Applied solution',
    },
    enabledNotes: {
      control: 'array',
      description: 'Enabled notes',
    },
    enabledSolution: {
      control: 'array',
      description: 'Enabled solutions',
    },
    configuredVersion: {
      control: { type: 'range', min: 1, max: 3, step: 1 },
      description: 'The configured version of saptune',
    },
    hostname: {
      control: 'text',
      description: 'The hostname',
      table: {
        type: { summary: 'string' },
      },
    },
    hostID: {
      control: 'text',
      description: 'The host identifier',
      table: {
        type: { summary: 'string' },
      },
    },
    packageVersion: {
      control: 'text',
      description: 'The saptune installed version',
      table: {
        type: { summary: 'string' },
      },
    },
    services: {
      control: 'array',
      description: 'Services',
    },
    staging: {
      control: 'object',
      description: 'Staging',
    },
    tuningState: {
      control: 'select',
      options: ['compliant', 'not compliant', 'not tuned'],
      description: 'The tuning state of saptune',
    },
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  render: (args) => (
    <ContainerWrapper>
      <SaptuneDetails {...args} />
    </ContainerWrapper>
  ),
};

export const Default = {
  args: {
    appliedNotes,
    appliedSolution,
    enabledNotes,
    enabledSolution,
    configuredVersion,
    hostname,
    hostID,
    packageVersion,
    services,
    staging,
    tuningState,
  },
};

export const StagingDisabled = {
  args: {
    ...Default.args,
    staging: { enabled: false, notes: [], solutions_ids: [] },
  },
};
export const SaptuneServiceStatusPassing = {
  args: {
    ...Default.args,

    services: [
      { name: 'saptune', enabled: 'enabled', active: 'active' },
      { name: 'sapconf', enabled: 'disabled', active: 'inactive' },
      { name: 'tuned', enabled: 'disabled', active: 'inactive' },
    ],
  },
};
export const SaptuneServiceStatusFailing = {
  args: {
    ...Default.args,

    services: [
      { name: 'saptune', enabled: 'disabled', active: 'inactive' },
      { name: 'sapconf', enabled: 'disabled', active: 'active' },
      { name: 'tuned', enabled: null, active: null },
    ],
  },
};

export const SaptuneServiceStatusWarning = {
  args: {
    ...Default.args,

    services: [
      { name: 'saptune', enabled: 'enabled', active: 'inactive' },
      { name: 'sapconf', enabled: 'enabled', active: 'inactive' },
      { name: 'tuned', enabled: 'enabled', active: 'active' },
    ],
  },
};
