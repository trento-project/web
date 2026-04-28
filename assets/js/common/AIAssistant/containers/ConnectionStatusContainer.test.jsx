import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { useAIConnectionStatus } from '../AssistantChatProvider';
import { ConnectionStatusContainer } from './ConnectionStatusContainer';

jest.mock('../AssistantChatProvider', () => ({
  useAIConnectionStatus: jest.fn(),
}));

describe('ConnectionStatusContainer', () => {
  it.each([
    { status: 'connected', text: 'Online' },
    { status: 'connecting', text: 'Connecting...' },
    { status: 'disconnected', text: 'Offline' },
  ])('renders $text when context status is $status', ({ status, text }) => {
    useAIConnectionStatus.mockReturnValue(status);
    render(<ConnectionStatusContainer />);
    expect(screen.getByText(text)).toBeVisible();
  });

  it('forwards className to the indicator', () => {
    useAIConnectionStatus.mockReturnValue('connected');
    const { container } = render(<ConnectionStatusContainer className="foo" />);
    expect(container.firstChild).toHaveClass('foo');
  });
});
