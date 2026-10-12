// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

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
