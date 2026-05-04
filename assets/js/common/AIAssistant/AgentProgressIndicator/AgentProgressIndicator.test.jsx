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
  it.each(['Thinking...', 'Calling get_hosts...'])(
    'renders the "%s" label',
    (label) => {
      render(<AgentProgressIndicatorView>{label}</AgentProgressIndicatorView>);
      expect(screen.getByText(label)).toBeVisible();
    }
  );

  it('renders a spinner alongside the label', () => {
    const { container } = render(
      <AgentProgressIndicatorView>Thinking...</AgentProgressIndicatorView>
    );
    expect(
      container.querySelector('svg, [role="status"], .animate-spin')
    ).not.toBeNull();
  });
});

describe('deriveProgressLabel', () => {
  it.each([
    {
      label: 'no parts',
      content: [],
      expected: 'Thinking...',
    },
    {
      label: 'only non-tool parts',
      content: [{ type: 'text', text: '' }],
      expected: 'Thinking...',
    },
    {
      label: 'tool call in flight',
      content: [
        { type: 'tool-call', toolName: 'get_hosts' },
        { type: 'tool-call', toolName: 'get_clusters' },
      ],
      expected: 'Calling get_clusters...',
    },
    {
      label: 'in-flight tool call without a name',
      content: [{ type: 'tool-call' }],
      expected: 'Calling tool...',
    },
    {
      label: 'tool call has a result (waiting for assistant text)',
      content: [{ type: 'tool-call', toolName: 'get_hosts', result: [] }],
      expected: 'Thinking...',
    },
    {
      label: 'an earlier tool completed but a new one is in flight',
      content: [
        { type: 'tool-call', toolName: 'get_hosts', result: [] },
        { type: 'tool-call', toolName: 'get_clusters' },
      ],
      expected: 'Calling get_clusters...',
    },
  ])('returns "$expected" when $label', ({ content, expected }) => {
    expect(deriveProgressLabel(content)).toBe(expected);
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
