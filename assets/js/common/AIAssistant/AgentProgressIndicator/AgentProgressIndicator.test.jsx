// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { useAuiState } from '@assistant-ui/react';
import AgentProgressIndicator, {
  AgentProgressIndicatorView,
  deriveProgressLabel,
} from './AgentProgressIndicator';

jest.mock('@assistant-ui/react', () => ({
  useAuiState: jest.fn(),
}));

const mockMessage = (message) => useAuiState.mockReturnValue(message);

describe('AgentProgressIndicatorView', () => {
  it.each(['Thinking...', 'Calling get_hosts...'])(
    'renders the "%s" label',
    (label) => {
      render(<AgentProgressIndicatorView>{label}</AgentProgressIndicatorView>);
      expect(screen.getByText(label)).toBeVisible();
    }
  );

  it('renders a spinner alongside the label', () => {
    render(
      <AgentProgressIndicatorView>Thinking...</AgentProgressIndicatorView>
    );
    expect(screen.getByRole('alert', { name: 'Loading' })).toBeVisible();
  });

  it('renders no spinner when the answer is not in progress', () => {
    render(
      <AgentProgressIndicatorView spinner={false}>
        Response stopped.
      </AgentProgressIndicatorView>
    );
    expect(screen.queryByRole('alert', { name: 'Loading' })).toBeNull();
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
  it('renders nothing when the thread is not running', () => {
    mockMessage({ content: [], isLast: true });
    const { container } = render(<AgentProgressIndicator isRunning={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when the assistant has already produced text', () => {
    mockMessage({
      content: [{ type: 'text', text: 'partial answer' }],
      isLast: true,
    });
    const { container } = render(<AgentProgressIndicator isRunning />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing on an earlier answer', () => {
    mockMessage({ content: [], isLast: false });
    const { container } = render(<AgentProgressIndicator isRunning />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders "Thinking..." while the thread is running and no content has streamed', () => {
    mockMessage({ content: [], isLast: true });
    render(<AgentProgressIndicator isRunning />);
    expect(screen.getByText('Thinking...')).toBeVisible();
  });

  it('renders the tool name while a tool call is in flight', () => {
    mockMessage({
      content: [{ type: 'tool-call', toolName: 'get_hosts' }],
      isLast: true,
    });
    render(<AgentProgressIndicator isRunning />);
    expect(screen.getByText('Calling get_hosts...')).toBeVisible();
  });

  describe('once the user has stopped the answer', () => {
    const cancelled = (overrides = {}) => ({
      content: [],
      isLast: true,
      status: { type: 'incomplete', reason: 'cancelled' },
      ...overrides,
    });

    it('says the response was stopped, without a spinner', () => {
      mockMessage(cancelled());

      render(<AgentProgressIndicator isRunning={false} />);

      expect(screen.getByText('Response stopped.')).toBeVisible();
      expect(screen.queryByRole('alert', { name: 'Loading' })).toBeNull();
    });

    it.each([
      { label: 'a later answer exists', overrides: { isLast: false } },
      {
        label: 'the answer got some text out',
        overrides: { content: [{ type: 'text', text: 'half an answer' }] },
      },
    ])('keeps the mark when $label', ({ overrides }) => {
      mockMessage(cancelled(overrides));

      render(<AgentProgressIndicator isRunning={false} />);

      expect(screen.getByText('Response stopped.')).toBeVisible();
    });

    it('stopped mark takes precedence over thinking', () => {
      mockMessage(cancelled());

      render(<AgentProgressIndicator isRunning />);

      expect(screen.getByText('Response stopped.')).toBeVisible();
      expect(screen.queryByText('Thinking...')).toBeNull();
    });
  });

  it.each([
    { label: 'the answer completed', status: { type: 'complete' } },
    {
      label: 'the answer failed',
      status: { type: 'incomplete', reason: 'error', error: 'boom' },
    },
  ])('renders nothing when $label', ({ status }) => {
    mockMessage({ content: [], isLast: true, status });

    const { container } = render(<AgentProgressIndicator isRunning={false} />);

    expect(container).toBeEmptyDOMElement();
  });
});
