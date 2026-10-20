// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React from 'react';
import { BrowserRouter } from 'react-router';

import SomethingWentWrong from './SomethingWentWrong';

export default {
  title: 'Components/SomethingWentWrong',
  component: SomethingWentWrong,
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
  argTypes: {},
};

export const Default = {
  args: {},
};
