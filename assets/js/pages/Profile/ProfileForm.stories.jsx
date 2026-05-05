import React from 'react';
import { action } from 'storybook/actions';
import { MemoryRouter } from 'react-router';
import { userFactory } from '@lib/test-utils/factories/users';

import ProfileForm from './ProfileForm';

const {
  fullname,
  email,
  username,
  created_at: createdAt,
  updated_at: updatedAt,
  abilities,
  analytics_enabled: analyticsEnabled,
  timezone,
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
      control: { type: 'text' },
    },
    emailAddress: {
      description: 'Email address',
      control: { type: 'text' },
    },
    username: {
      description: 'Username',
      control: { type: 'text' },
    },
    abilities: {
      description: 'User abilities array',
      control: { type: 'text' },
    },
    errors: {
      description: 'OpenAPI errors coming from backend validation',
      control: { type: 'text' },
    },
    onSave: {
      action: 'Save user',
      description: 'Save user action',
      control: { type: 'text' },
    },
    totpEnabled: {
      description: 'User TOTP enabled',
      control: { type: 'boolean' },
    },
    totpSecret: {
      description: 'User TOTP secret',
      control: { type: 'text' },
    },
    totpQrData: {
      description: 'User TOTP secret encoded as qr',
      control: { type: 'text' },
    },
    totpBoxOpen: {
      description: 'Show TOTP enrollment box',
      control: { type: 'text' },
    },
    analyticsEulaAccepted: {
      description: 'Whether the user accepted the analytics EULA',
      control: { type: 'text' },
    },
    timezone: {
      type: 'string',
      description: 'Timezone string for date formatting.',
      control: { type: 'text' },
      defaultValue: 'Etc/UTC',
    },
    timezones: {
      description:
        'Available timezone options for the timezone select (array of { value, label })',
      control: { type: 'text' },
    },
    disableForm: {
      description: 'When true, disables all inputs and actions in the form',
      control: { type: 'text' },
    },
    singleSignOnEnabled: {
      description: 'Single sign on login is enabled',
      control: { type: 'boolean' },
    },
    analyticsEnabledConfig: {
      description:
        'Toggles visibility of Analytics switch. Analytics config is enabled',
      control: { type: 'boolean' },
    },
    analyticsEnabled: {
      description: 'Toggles tracking user analytics',
      control: { type: 'boolean' },
    },
    toggleTotpBox: {
      description: 'Callback to open or close the TOTP enrollment box',
      control: { type: 'text' },
    },
    loading: {
      description: 'Indicates whether the form is in a loading state',
      control: { type: 'boolean' },
    },
    togglePasswordModal: {
      description: 'Callback to open or close the password change modal',
      control: { type: 'text' },
    },
    onResetTotp: {
      description: "Callback invoked to reset the user's TOTP (disable TOTP)",
      control: { type: 'text' },
    },
    onVerifyTotp: {
      description: 'Callback invoked to verify a TOTP token during enrollment',
      control: { type: 'text' },
    },
    onEnableTotp: {
      description: 'Callback invoked to start the TOTP enrollment flow',
      control: { type: 'text' },
    },
    passwordModalOpen: {
      description: 'Whether the change-password modal is currently open',
      control: { type: 'text' },
    },
  },
  render: (args) => (
    <ContainerWrapper>
      <MemoryRouter>
        <ProfileForm {...args} />
      </MemoryRouter>
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
    analyticsEnabledConfig: true,
    analyticsEnabled,
    timezone,
    timezones: ['GMT+00:00', 'GMT+01:00', 'GMT+02:00'],
    onSave: action('onSave'),
    onCancel: action('onCancel'),
    toggleTotpBox: action('toggleTotpBox'),
    togglePasswordModal: action('togglePasswordModal'),
    onResetTotp: action('onResetTotp'),
    onVerifyTotp: action('onVerifyTotp'),
    onEnableTotp: action('onEnableTotp'),
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
    analyticsEnabledConfig: true,
    loading: true,
    timezone,
  },
};

export const WithTotpEnrollmentBoxEnabled = {
  args: {
    ...Default.args,
    totpEnabled: false,
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

export const SingleSignOnEnabled = {
  args: {
    ...Default.args,
    singleSignOnEnabled: true,
  },
};
