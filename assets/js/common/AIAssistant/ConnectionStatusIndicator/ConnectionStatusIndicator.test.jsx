import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { ConnectionStatusIndicator } from './ConnectionStatusIndicator';

describe('ConnectionStatusIndicator', () => {
  it.each([
    {
      status: 'connected',
      text: 'Online',
      dot: 'bg-green-500',
      title: 'Connected',
    },
    {
      status: 'connecting',
      text: 'Connecting...',
      dot: 'bg-yellow-500',
      title: 'Connecting...',
    },
    {
      status: 'disconnected',
      text: 'Offline',
      dot: 'bg-red-500',
      title: 'Disconnected',
    },
  ])('renders the $status status', ({ status, text, dot, title }) => {
    const { container } = render(<ConnectionStatusIndicator status={status} />);
    expect(screen.getByText(text)).toBeVisible();
    expect(container.querySelector(`[title="${title}"]`)).toHaveClass(dot);
  });

  it('falls back to the disconnected style for an unknown status', () => {
    render(<ConnectionStatusIndicator status="unknown" />);
    expect(screen.getByText('Offline')).toBeVisible();
  });

  it('appends the provided className to the wrapper', () => {
    const { container } = render(
      <ConnectionStatusIndicator status="connected" className="custom-cls" />
    );
    expect(container.firstChild).toHaveClass('custom-cls');
  });
});
