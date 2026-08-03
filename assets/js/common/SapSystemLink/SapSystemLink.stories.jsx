// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { APPLICATION_TYPE, DATABASE_TYPE } from '@lib/model/sapSystems';
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
      description: 'Type of SAP system',
      control: { type: 'select' },
      options: [DATABASE_TYPE, APPLICATION_TYPE],
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
    systemType: undefined,
    sapSystemId: id,
    children: sid,
  },
};

export const Application = {
  args: {
    ...Default.args,
    systemType: APPLICATION_TYPE,
  },
};

export const Database = {
  args: {
    ...Default.args,
    systemType: DATABASE_TYPE,
  },
};
