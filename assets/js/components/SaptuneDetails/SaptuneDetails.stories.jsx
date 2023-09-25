import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import { hostFactory, saptuneStatusFactory } from '@lib/test-utils/factories';

import SaptuneDetails from './SaptuneDetails';

const { hostname, id: hostID } = hostFactory.build();
const {
  package_version: packageVersion,
  configured_version: configuredVersion,
  tuning_state: tuningState,
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
    configuredVersion: {
      control: 'text',
      description: 'The configured version of saptune',
      table: {
        type: { summary: 'string' },
      },
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
    tuningState: {
      control: 'text',
      description: 'The tuning state of saptune',
      table: {
        type: { summary: 'string' },
      },
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
    configuredVersion,
    hostname,
    hostID,
    packageVersion,
    tuningState,
  },
};
