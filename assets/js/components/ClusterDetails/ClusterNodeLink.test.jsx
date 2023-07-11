import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithRouterMatch } from '@lib/test-utils';
import ClusterNodeLink from '@components/ClusterDetails/ClusterNodeLink';

describe('ClusterNodeLink', () => {
  it('renders HostLink when hostId is provided', () => {
    const hostId = '12345678-abcd-1234-abcd-1234567890ab';
    const name = 'host01';
    const path = '/hosts/:hostId';

    renderWithRouterMatch(<ClusterNodeLink hostId={hostId} name={name} />, {
      path,
      route: `/hosts/${hostId}`,
    });

    const hostLinkElement = screen.getByRole('link', { name });

    expect(hostLinkElement).toBeInTheDocument();
    expect(hostLinkElement).toHaveAttribute('href', `/hosts/${hostId}`);
  });

  it('renders warning span when hostId is not provided', () => {
    const name = 'host02';

    render(<ClusterNodeLink name={name} />);
    expect(
      screen.getByText('Host currently not registered.')
    ).toBeInTheDocument();
  });
});
