// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { action } from 'storybook/actions';

import Arrow from './Arrow';

export default {
  title: 'Components/Arrow',
  component: Arrow,
  argTypes: {
    children: {
      description: 'Content or text displayed inside the component',
      control: { type: 'text' },
    },
    onClick: {
      description: 'Callback function invoked when click',
      action: 'onClick',
    },
  },
};

export const Default = {
  args: {
    children: '→',
    onClick: action('onClick'),
  },
};
