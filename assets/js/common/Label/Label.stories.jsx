// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import Label from './Label';

export default {
  title: 'Components/Label',
  component: Label,
  argTypes: {
    children: {
      description: 'Label content',
      control: { type: 'text' },
    },
    className: {
      description: 'CSS classes',
      control: { type: 'text' },
    },
    info: {
      description: 'Tooltip for user education',
      control: { type: 'text' },
    },
    required: {
      description: 'Whether this field is required or not',
      control: { type: 'boolean' },
    },
  },
};

export const Default = {
  args: {
    children: 'This is a label',
  },
};

export const Required = {
  args: {
    ...Default.args,
    children: 'This is a label',
    required: true,
  },
};

export const WithInfo = {
  args: {
    ...Default.args,
    children: 'This is a label',
    info: 'This is a tooltip for user education',
  },
};

export const WithInfoRequired = {
  args: {
    ...Default.args,
    children: 'This is a label',
    info: 'This is a tooltip for user education',
    required: true,
  },
};
