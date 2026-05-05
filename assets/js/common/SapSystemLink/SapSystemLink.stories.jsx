// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { sapSystemFactory } from '@lib/test-utils/factories';
import React from 'react';
import { MemoryRouter } from 'react-router';

import SapSystemLink from './SapSystemLink';

const { id, sid } = sapSystemFactory.build();

export default {
  title: 'Components/SapSystemLink',
  component: SapSystemLink,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  argTypes: {
    systemType: {
      description: 'The systemType prop',
      control: { type: 'text' },
    },
    sapSystemId: {
      description: 'Unique identifier for the SAP system',
      control: { type: 'text' },
    },
    children: {
      description: 'Content or text displayed inside the component',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    systemType: 'database',
    sapSystemId: id,
    children: sid,
  },
};
