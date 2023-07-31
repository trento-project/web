import React from 'react';
import { screen, render, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { renderWithRouter } from '@lib/test-utils';
import ClusterNodeLink from '@components/ClusterDetails/ClusterNodeLink';
import { hostFactory } from '@lib/test-utils/factories';

describe('ClusterNodeLink', () => {
  it('renders HostLink when hostId is provided', () => {
    const { id, hostname } = hostFactory.build();

    renderWithRouter(<ClusterNodeLink hostId={id}>{hostname}</ClusterNodeLink>);

    const hostLinkElement = screen.getByRole('link', { hostname });

    expect(hostLinkElement).toBeInTheDocument();
    expect(hostLinkElement).toHaveAttribute('href', `/hosts/${id}`);
  });

  it('renders warning span when hostId is not provided', async () => {
    const user = userEvent.setup();
    const { hostname } = hostFactory.build();

    render(<ClusterNodeLink>{hostname}</ClusterNodeLink>);

    await act(async () => user.hover(screen.queryByText(hostname)));

    await waitFor(() =>
      expect(screen.getByText('Host currently not registered.')).toBeVisible()
    );
  });
});
