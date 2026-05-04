import React from 'react';
import { Provider } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router';
import Component from './CheckResultOutline';

const mockStore = configureStore({
  reducer: {},
});

export default {
  title: 'Components/CheckResultOutline',
  component: Component,
  decorators: [
    (Story) => (
      <Provider store={mockStore}>
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      </Provider>
    ),
  ],
  argTypes: {
    checkID: {
      description: 'Identifier for the checkID',
      control: { type: 'text' },
    },
    targetID: {
      description: 'Identifier for the targetID',
      control: { type: 'text' },
    },
    targetName: {
      description: 'The targetName prop',
      control: { type: 'text' },
    },
    targetType: {
      description: 'The targetType prop',
      control: { type: 'text' },
    },
    expectations: {
      description: 'The expectations prop',
      control: { type: 'object' },
    },
    agentsCheckResults: {
      description: 'The agentsCheckResults prop',
      control: { type: 'object' },
    },
    expectationResults: {
      description: 'The expectationResults prop',
      control: { type: 'object' },
    },
  },
};

export const Default = {
  args: {
    checkID: 'check-1',
    targetID: 'target-1',
    targetName: 'Target Name',
    targetType: 'cluster',
    expectations: [],
    agentsCheckResults: [],
    expectationResults: [],
  },
};
