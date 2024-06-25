import React from 'react';

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
      action: 'Loading state',
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

export const Loading = {
  args: {
    loading: true,
  },
};

export const Empty = {};

export const WithErrors = {
  args: {
    ...Empty.args,
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
