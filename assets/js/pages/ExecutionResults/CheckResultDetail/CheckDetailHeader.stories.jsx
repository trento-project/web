import React from 'react';
import { MemoryRouter } from 'react-router';
import CheckResultDetail from '.';
import { providers } from '@lib/model';

export default {
  title: 'Components/CheckDetailHeader',
  component: CheckResultDetail,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  argTypes: {
    checkID: {
      description: 'Identifier for the checkID',
      control: { type: 'text' },
    },
    checkDescription: {
      description: 'The checkDescription prop',
      control: { type: 'text' },
    },
    targetID: {
      description: 'Identifier for the targetID',
      control: { type: 'text' },
    },
    targetType: {
      description: 'The targetType prop',
      control: { type: 'text' },
    },
    resultTargetType: {
      description: 'The resultTargetType prop',
      control: { type: 'text' },
    },
    resultTargetName: {
      description: 'The resultTargetName prop',
      control: { type: 'text' },
    },
    provider: {
      description: 'Cloud provider',
      control: { type: 'select' },
      options: [...providers, 'unrecognized-provider'],
    },
    result: {
      description: 'The result prop',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    checkID: 'check-123',
    checkDescription: 'Check cluster configuration',
    targetID: 'cluster-01',
    targetType: 'cluster',
    resultTargetType: 'cluster',
    resultTargetName: 'Cluster 1',
    cloudProvider: 'aws',
    result: 'passing',
  },
};
