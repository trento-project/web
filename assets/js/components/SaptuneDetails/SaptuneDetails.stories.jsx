import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import { hostFactory, saptuneStatusFactory } from '@lib/test-utils/factories';

import SaptuneDetails from './SaptuneDetails';

const { hostname, id: hostID } = hostFactory.build();
const {
  package_version: packageVersion,
  configured_version: configuredVersion,
  tuning_state: tuningState,
  applied_notes: appliedNotes,
  applied_solution: appliedSolution,
  enabled_solution: enabledSolution,
  enabled_notes: enabledNotes,
  services,
  staging,
} = saptuneStatusFactory.build();

function ContainerWrapper({ children }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">{children}</div>
  );
}

export default {
  title: 'SaptuneDetails',
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
      description: 'The host name',
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
      control: 'array',
      description: 'Staging',
    },
    tuningState: {
      control: 'select',
      options: ['compliant', 'not compliant', 'no tuning'],
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
