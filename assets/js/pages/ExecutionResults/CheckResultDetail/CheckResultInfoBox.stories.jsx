// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { providers } from '@lib/model';

import CheckResultInfoBox from './CheckResultInfoBox';

export default {
  title: 'Components/CheckResultInfoBox',
  component: CheckResultInfoBox,
  argTypes: {
    checkID: {
      description: 'Identifier for the checkID',
      control: { type: 'text' },
    },
    targetType: {
      description: 'Type of the target',
      options: ['host', 'cluster'],
      control: { type: 'select' },
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
  },
};

export const Default = {
  args: {
    checkID: 'check-123',
    resultTargetType: 'cluster',
    resultTargetName: 'Cluster 1',
    provider: 'aws',
  },
};
