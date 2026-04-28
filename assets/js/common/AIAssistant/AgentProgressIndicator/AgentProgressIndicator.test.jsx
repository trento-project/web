import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { useAuiState } from '@assistant-ui/react';
import {
  AgentProgressIndicator,
  AgentProgressIndicatorView,
  deriveProgressLabel,
} from './AgentProgressIndicator';

let mockThread = { isRunning: true };

jest.mock('@assistant-ui/react', () => ({
  AuiIf: ({ children, condition }) =>
    condition({ thread: mockThread }) ? children : null,
  useAuiState: jest.fn(),
}));

describe('AgentProgressIndicatorView', () => {
  it.each(['Thinking...', 'Calling get_hosts...', 'Preparing response...'])(
    'renders the "%s" label',
    (label) => {
      render(<AgentProgressIndicatorView label={label} />);
      expect(screen.getByText(label)).toBeVisible();
    }
  );

  it('renders a spinner alongside the label', () => {
    const { container } = render(
      <AgentProgressIndicatorView label="Thinking..." />
    );
    expect(
      container.querySelector('svg, [role="status"], .animate-spin')
    ).not.toBeNull();
  });
});

describe('deriveProgressLabel', () => {
  it('returns "Thinking..." when there are no tool calls', () => {
    expect(deriveProgressLabel([])).toBe('Thinking...');
    expect(deriveProgressLabel([{ type: 'text', text: '' }])).toBe(
      'Thinking...'
    );
  });

  it('returns the latest tool name when tool calls are present', () => {
    expect(
      deriveProgressLabel([
        { type: 'tool-call', toolName: 'get_hosts' },
        { type: 'tool-call', toolName: 'get_clusters' },
      ])
    ).toBe('Calling get_clusters...');
  });

  it('falls back to "tool" when toolName is missing', () => {
    expect(deriveProgressLabel([{ type: 'tool-call' }])).toBe(
      'Calling tool...'
    );
  });
});

describe('AgentProgressIndicator', () => {
  beforeEach(() => {
    mockThread = { isRunning: true };
  });

  it('renders nothing when the thread is not running', () => {
    mockThread = { isRunning: false };
    useAuiState.mockReturnValue({ content: [] });
    const { container } = render(<AgentProgressIndicator />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when the assistant has already produced text', () => {
    useAuiState.mockReturnValue({
      content: [{ type: 'text', text: 'partial answer' }],
    });
    const { container } = render(<AgentProgressIndicator />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders "Thinking..." while the thread is running and no content has streamed', () => {
    useAuiState.mockReturnValue({ content: [] });
    render(<AgentProgressIndicator />);
    expect(screen.getByText('Thinking...')).toBeVisible();
  });

  it('renders the tool name while a tool call is in flight', () => {
    useAuiState.mockReturnValue({
      content: [{ type: 'tool-call', toolName: 'get_hosts' }],
    });
    render(<AgentProgressIndicator />);
    expect(screen.getByText('Calling get_hosts...')).toBeVisible();
  });
});
