// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import ObjectTreeIcon from './ObjectTreeIcon';

export default {
  title: 'Components/ObjectTreeIcon',
  component: ObjectTreeIcon,
  argTypes: {
    expanded: {
      description: 'The expanded prop',
      control: { type: 'boolean' },
    },
  },
};

export const Default = {
  args: {
    expanded: '',
  },
};
