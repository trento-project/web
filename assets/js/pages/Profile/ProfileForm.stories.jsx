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
    totpEnabled: {
      description: 'User TOTP enabled',
      control: {
        type: 'boolean',
      },
    },
    totpSecret: {
      description: 'User TOTP secret',
      control: {
        type: 'text',
      },
    },
    totpQrData: {
      description: 'User TOTP secret encoded as qr',
      control: {
        type: 'text',
      },
    },
    totpBoxOpen: {
      description: 'Show TOTP enrollment box',
      control: {
        type: 'text',
      },
    },
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
    totpSecret: 'HKJDFHJKHDIU379847HJKDJKH',
    totpQrData:
      'otpauth://totp/Example:alice@google.com?secret=JBSWY3DPEHPK3PXP&issuer=Example',
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

export const WithTotpEnrollmentBoxEnabled = {
  args: {
    ...Default.args,
    totpEnabled: true,
    totpBoxOpen: true,
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
