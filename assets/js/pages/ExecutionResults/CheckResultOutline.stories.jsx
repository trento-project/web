// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import {
  agentCheckResultFactory,
  catalogFactory,
  expectationResultFactory,
} from '@lib/test-utils/factories';
import { configureStore } from '@reduxjs/toolkit';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';

import CheckResultOutline from './CheckResultOutline';

const catalog = catalogFactory.build();
const agentsCheckResults = agentCheckResultFactory
  .buildList(2)
  .map((result) => ({
    ...result,
    expectation_evaluations: [
      { name: 'expectation_1', result: true, type: 'expect' },
      { name: 'expectation_2', result: true, type: 'expect' },
    ],
  }));
const expectationResults = expectationResultFactory.buildList(2);

const mockStore = configureStore({
  reducer: {},
});

const check = catalog.catalog || {};
const checkIDs = Object.keys(check);
const checkID = checkIDs.length > 0 ? checkIDs[0] : 'check-1';
const checkData = check[checkID] || {};
const expectations = checkData.expectations || [
  {
    name: 'expect_test_1',
    value: 'some_value',
    type: 'expect',
    expectations: [
      {
        name: 'test_expectation_1',
        type: 'expect',
      },
      {
        name: 'test_expectation_2',
        type: 'expect',
      },
    ],
  },
  {
    name: 'expect_test_2',
    value: 'another_value',
    type: 'expect_enum',
    expectations: [
      {
        name: 'test_expectation_3',
        type: 'expect_enum',
      },
    ],
  },
];

export default {
  title: 'Components/CheckResultOutline',
  component: CheckResultOutline,
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
      description: 'Type of the target',
      options: ['host', 'cluster'],
      control: { type: 'select' },
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
    checkID,
    targetID: 'target-1',
    targetName: 'Target Name',
    targetType: 'cluster',
    expectations,
    agentsCheckResults,
    expectationResults,
  },
};

export const Empty = {
  args: {
    ...Default.args,
    expectations: [],
    agentsCheckResults: [],
    expectationResults: [],
  },
};

export const WithExpectations = {
  args: {
    ...Default.args,
    expectations,
  },
};
