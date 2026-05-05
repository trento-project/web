import React from 'react';
import { BrowserRouter } from 'react-router';
import Component from './InstanceOverview';

import { action } from 'storybook/actions';
export default {
  title: 'Components/InstanceOverview',
  component: Component,
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
  argTypes: {
    instanceType: {
      description: 'The instanceType prop',
      control: { type: 'text' },
    },
    instance: {
      description: 'The instance prop',
      control: { type: 'object' },
    },
    userAbilities: {
      description: 'The userAbilities prop',
      control: { type: 'object' },
    },
    cleanUpPermittedFor: {
      description: 'The cleanUpPermittedFor prop',
      control: { type: 'object' },
    },
    onCleanUpClick: {
      description: 'Callback function invoked when clean up click',
      action: 'onCleanUpClick',
    },
  },
};

export const Default = {
  args: {
    instanceType: 'application',
    instance: {
      name: 'ERP',
      type: 'SAP',
      health: 'passing',
      hostname: 'host-01',
      sid: 'ERP',
      instance_number: '00',
      features: 'ABAP|GATEWAY',
    },
    userAbilities: [],
    cleanUpPermittedFor: [],
    onCleanUpClick: action('onCleanUpClick'),
  },
};
