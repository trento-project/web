import React from 'react';
import { screen, act, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { renderWithRouter } from '@lib/test-utils';
import { hostFactory } from '@lib/test-utils/factories';

import ClusterNodeName from './ClusterNodeName';

describe('ClusterNodeName', () => {
  it.each([
    {
      status: 'Online',
      resources: [],
      testID: 'tn-online',
      expectedMessage: 'Online',
    },
    {
      status: 'Online',
      resources: [{ managed: true }, { managed: false }],
      testID: 'tn-online',
      expectedMessage: '1 unmanaged resources',
    },
    {
      status: 'Offline',
      resources: [],
      testID: 'tn-offline',
      expectedMessage: 'Offline',
    },
    {
      status: 'Maintenance',
      resources: [],
      testID: 'tn-maintenance',
      expectedMessage: 'Maintenance',
    },
    {
      status: 'Other',
      resources: [],
      testID: 'tn-unknown',
      expectedMessage: 'Other',
    },
  ])(
    'renders correct icon',
    async ({ status, resources, testID, expectedMessage }) => {
      const user = userEvent.setup();

      const { id, hostname } = hostFactory.build();
      renderWithRouter(
        <ClusterNodeName status={status} hostId={id} resources={resources}>
          {hostname}
        </ClusterNodeName>
      );

      const icon = screen.getByTestId('eos-svg-component');
      expect(icon).toHaveClass(testID);
      await act(async () => user.hover(icon));
      const tooltip = screen.getByRole('tooltip');
      expect(within(tooltip).getByText(expectedMessage)).toBeVisible();
    }
  );
});
