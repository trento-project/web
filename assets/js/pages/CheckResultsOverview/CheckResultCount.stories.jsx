// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { CRITICAL, PASSING, WARNING } from '@lib/model';
import { action } from 'storybook/actions';

import CheckResultCount from './CheckResultCount';

export default {
  title: 'Layouts/CheckResultsOverview/CheckResultCount',
  component: CheckResultCount,
  argTypes: {
    value: {
      description: 'Numeric count to display',
      control: { type: 'number' },
    },
    result: {
      description: 'Result type to display (affects icon/color)',
      control: { type: 'select' },
      options: [WARNING, CRITICAL, PASSING],
    },
    onClick: {
      action: 'onClick',
      description: 'Click handler when the row is clicked',
    },
  },
};

export const Default = {
  args: {
    value: 0,
    result: 'passing',
    onClick: action('onClick'),
  },
};

export const Passing = {
  args: {
    ...Default.args,
    value: 42,
    result: 'passing',
    onClick: action('onClick'),
  },
};

export const Warning = {
  args: {
    ...Default.args,
    value: 7,
    result: 'warning',
    onClick: action('onClick'),
  },
};

export const Critical = {
  args: {
    ...Default.args,
    value: 2,
    result: 'critical',
    onClick: action('onClick'),
  },
};
