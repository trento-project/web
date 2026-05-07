// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { providers } from '@lib/model';
import React from 'react';
import { MemoryRouter } from 'react-router';

import CheckDetailHeader from './CheckDetailHeader';

export default {
  title: 'Components/CheckDetailHeader',
  component: CheckDetailHeader,
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
      description: 'Type of the target',
      options: ['host', 'cluster'],
      control: { type: 'select' },
    },
    resultTargetType: {
      description: 'The resultTargetType prop',
      control: { type: 'text' },
    },
    resultTargetName: {
      description: 'The resultTargetName prop',
      control: { type: 'text' },
    },
    cloudProvider: {
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
