// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { BrowserRouter } from 'react-router';
import { action } from 'storybook/actions';

import BackButton from './BackButton';

export default {
  title: 'Components/BackButton',
  component: BackButton,
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
  argTypes: {
    children: {
      description: 'The text to display inside the button.',
      control: { type: 'text' },
    },
    url: {
      description:
        'The URL to navigate to when the button is clicked. If `onClick` is provided, this prop is ignored.',
      control: { type: 'text' },
    },
    onClick: {
      description: 'Callback to be called when the button is clicked.',
      action: 'onClick',
    },
  },
};

export const Default = {
  args: {
    children: 'Back to something',
    url: '/',
    onClick: action('onClick'),
  },
};
