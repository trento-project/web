import React from 'react';
import { userFactory } from '@lib/test-utils/factories/users';

import ProfileForm from './ProfileForm';

const {
  fullname,
  email,
  username,
  created_at: createdAt,
  updated_at: updatedAt,
  abilities,
} = userFactory.build();

function ContainerWrapper({ children }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">{children}</div>
  );
}

export default {
  title: 'Layouts/ProfileForm',
  component: ProfileForm,
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
    abilities: {
      description: 'User abilities array',
    },
    errors: {
      description: 'OpenAPI errors coming from backend validation',
    },
    onSave: {
      action: 'Save user',
      description: 'Save user action',
    },
  },
  args: {
    username,
    abilities,
  },
  render: (args) => (
    <ContainerWrapper>
      <ProfileForm {...args} />
    </ContainerWrapper>
  ),
};

export const Default = {
  args: {
    username,
    abilities,
  },
};

export const Loading = {
  args: {
    fullName: fullname,
    emailAddress: email,
    username,
    createdAt,
    abilities,
    updatedAt,
    loading: true,
  },
};

export const WithErrors = {
  args: {
    ...Default.args,
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
    ],
  },
};
