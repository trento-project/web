// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { action } from 'storybook/actions';

import ProfilePasswordChangeForm from './ProfilePasswordChangeForm';

function ContainerWrapper({ children }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">{children}</div>
  );
}

export default {
  title: 'Components/ProfilePasswordChangeForm',
  component: ProfilePasswordChangeForm,
  argTypes: {
    errors: {
      description: 'OpenAPI errors coming from backend validation',
      control: { type: 'object' },
    },
    onSave: {
      action: 'Save password payload',
      description: 'Save password action',
    },
    onCancel: {
      action: 'Cancel password update',
      description: 'Cancel Action',
    },
    loading: {
      description: 'Loading state',
      control: { type: 'boolean' },
    },
  },
  args: {
    loading: false,
  },
  render: (args) => (
    <ContainerWrapper>
      <ProfilePasswordChangeForm {...args} />
    </ContainerWrapper>
  ),
};

export const Default = {
  args: {
    errors: [],
    loading: false,
    onSave: action('onSave'),
    onCancel: action('onCancel'),
  },
};

export const Loading = {
  args: {
    ...Default.args,
    loading: true,
  },
};

export const Empty = {};

export const WithErrors = {
  args: {
    ...Default.args,
    errors: [
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
      {
        detail: 'Error validating current_password',
        source: { pointer: '/current_password' },
        title: 'Invalid value',
      },
    ],
  },
};
