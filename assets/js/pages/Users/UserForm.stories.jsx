import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import { adminUser, userFactory } from '@lib/test-utils/factories/users';

import UserForm from './UserForm';

const {
  fullname,
  email,
  username,
  created_at: createdAt,
  updated_at: updatedAt,
} = userFactory.build();

const {
  fullname: adminFullName,
  email: adminEmail,
  username: adminUsername,
} = adminUser.build();

function ContainerWrapper({ children }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">{children}</div>
  );
}

export default {
  title: 'Components/UserForm',
  component: UserForm,
  argTypes: {
    fullName: {
      description: 'Full name',
      control: {
        type: 'text',
      },
    },
    emailAddress: {
      description: 'Email address',
      control: {
        type: 'text',
      },
    },
    username: {
      description: 'Username',
      control: {
        type: 'text',
      },
    },
    status: {
      control: { type: 'radio' },
      options: ['Enabled', 'Disabled'],
      description: 'Status',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'Enabled' },
      },
    },
    createdAt: {
      description: 'User creation timestamp',
      control: {
        type: 'text',
      },
    },
    udpatedAt: {
      description: 'User last update timestamp',
      control: {
        type: 'text',
      },
    },
    editing: {
      description: 'User is being edited',
      control: {
        type: 'boolean',
      },
    },
    saving: {
      description: 'User is being saved',
      control: {
        type: 'boolean',
      },
    },
    saveEnabled: {
      description: 'User saving is enabled',
      control: {
        type: 'boolean',
      },
    },
    saveText: {
      description: 'Save button text',
      control: {
        type: 'text',
      },
    },
    errors: {
      description: 'OpenAPI errors coming from backend validation',
    },
    onSave: {
      action: 'Save user',
      description: 'Save user action',
    },
    onCancel: {
      action: 'Cancel user creation',
      description: 'Cancel user creation',
    },
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  render: (args) => (
    <ContainerWrapper>
      <UserForm {...args} />
    </ContainerWrapper>
  ),
};

export const Empty = {};

export const Editing = {
  args: {
    fullName: fullname,
    emailAddress: email,
    username,
    createdAt,
    updatedAt,
    editing: true,
    saveText: 'Edit',
  },
};

export const Admin = {
  args: {
    ...Editing.args,
    fullName: adminFullName,
    emailAddress: adminEmail,
    username: adminUsername,
    saveEnabled: false,
  },
};

export const WithErrors = {
  args: {
    ...Editing.args,
    errors: [
      {
        detail: 'Error validating fullname',
        source: { pointer: '/fullname' },
        title: 'Invalid value',
      },
      {
        detail: 'Error validating email',
        source: { pointer: '/email' },
        title: 'Invalid value',
      },
      {
        detail: 'Error validating username',
        source: { pointer: '/username' },
        title: 'Invalid value',
      },
      {
        detail: 'Error validating password',
        source: { pointer: '/password' },
        title: 'Invalid value',
      },
      {
        detail: 'Error validating password_confirmation',
        source: { pointer: '/password_confirmation' },
        title: 'Invalid value',
      },
    ],
  },
};
