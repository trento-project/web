// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import ModifiedCheckPill from './ModifiedCheckPill';

export default {
  title: 'Components/ModifiedCheckPill',
  component: ModifiedCheckPill,
  argTypes: {
    className: {
      description: 'Additional CSS classes applied to the component',
      control: { type: 'text' },
    },
    content: {
      description: 'The content prop',
      control: { type: 'text' },
    },
    customized: {
      description: 'The customized prop',
      control: { type: 'boolean' },
    },
  },
};

export const Default = {
  args: {
    className: 'my-class',
    content: 'Modified Check',
    customized: true,
  },
};
