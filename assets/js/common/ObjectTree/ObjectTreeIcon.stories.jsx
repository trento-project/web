// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import ObjectTreeIcon from './ObjectTreeIcon';

export default {
  title: 'Components/ObjectTreeIcon',
  component: ObjectTreeIcon,
  argTypes: {
    expanded: {
      description: 'Whether the tree node is expanded',
      control: { type: 'boolean' },
    },
  },
};

export const Default = {
  args: {
    expanded: false,
  },
};

export const Expanded = {
  args: {
    expanded: true,
  },
};
