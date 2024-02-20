import React from 'react';
import { screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { renderWithRouter } from '@lib/test-utils';
import { hostFactory } from '@lib/test-utils/factories';

import ClusterNodeName from './ClusterNodeName';

describe('ClusterNodeName', () => {
  it.each([
    {
      status: 'Online',
      testID: 'tn-online',
    },
    {
      status: 'Offline',
      testID: 'tn-offline',
    },
    {
      status: 'Maintenance',
      testID: 'tn-maintenance',
    },
    {
      status: 'Other',
      testID: 'tn-unknown',
    },
  ])('renders correct icon', async ({ status, testID }) => {
    const user = userEvent.setup();

    const { id, hostname } = hostFactory.build();

    renderWithRouter(
      <ClusterNodeName status={status} hostId={id}>
        {hostname}
      </ClusterNodeName>
    );

    const icon = screen.getByTestId('eos-svg-component');
    expect(icon).toHaveClass(testID);
    await act(async () => user.hover(icon));

    expect(screen.getByText(status)).toBeVisible();
  });
});
