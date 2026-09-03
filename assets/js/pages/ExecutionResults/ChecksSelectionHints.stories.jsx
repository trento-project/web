// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { catalogFactory, hostFactory } from '@lib/test-utils/factories';
import React from 'react';
import { MemoryRouter } from 'react-router';
import { action } from 'storybook/actions';

import ChecksSelectionHints from './ChecksSelectionHints';

const hosts = hostFactory.buildList(2);
const catalog = catalogFactory.build();
const checks = Object.keys(catalog.catalog || {}).slice(0, 3);

export default {
  title: 'Components/ChecksSelectionHints',
  component: ChecksSelectionHints,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  argTypes: {
    targetID: {
      description: 'Identifier for the targetID',
      control: { type: 'text' },
    },
    targetType: {
      description: 'Type of the target',
      options: ['host', 'cluster'],
      control: { type: 'select' },
    },
    selectedChecks: {
      description: 'The selectedChecks prop',
      control: { type: 'object' },
    },
    hosts: {
      description: 'The hosts prop',
      control: { type: 'object' },
    },
    onStartExecution: {
      description: 'Callback function invoked when start execution',
      action: 'onStartExecution',
    },
  },
};

export const Default = {
  args: {
    targetID: 'target-1',
    targetType: 'cluster',
    selectedChecks: checks.slice(0, 3),
    hosts,
    onStartExecution: action('onStartExecution'),
  },
};

export const NoChecks = {
  args: {
    ...Default.args,
    selectedChecks: [],
  },
};

export const WithAllChecks = {
  args: {
    ...Default.args,
    selectedChecks: checks,
  },
};
