// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import AgentProgressIndicator, {
  AgentProgressIndicatorView,
  deriveProgressLabel,
} from './AgentProgressIndicator';

describe('AgentProgressIndicatorView', () => {
  it.each(['Thinking...', 'Calling get_hosts...'])(
    'renders the "%s" label',
    (label) => {
      render(<AgentProgressIndicatorView>{label}</AgentProgressIndicatorView>);
      expect(screen.getByText(label)).toBeVisible();
      expect(screen.getByRole('status')).toHaveTextContent(label);
    }
  );

  it('renders a spinner alongside the label', () => {
    render(
      <AgentProgressIndicatorView>Thinking...</AgentProgressIndicatorView>
    );

    const spinner = screen.getByLabelText('Loading');

    expect(spinner).toBeVisible();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(spinner).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders no spinner when the answer is not in progress', () => {
    render(
      <AgentProgressIndicatorView spinner={false}>
        Response stopped.
      </AgentProgressIndicatorView>
    );
    expect(screen.queryByLabelText('Loading')).toBeNull();
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
    const message = { content: [], isLast: true };
    const { container } = render(
      <AgentProgressIndicator isRunning={false} message={message} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when the assistant has already produced text', () => {
    const message = {
      content: [{ type: 'text', text: 'partial answer' }],
      isLast: true,
    };
    const { container } = render(
      <AgentProgressIndicator isRunning={true} message={message} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing on an earlier answer', () => {
    const message = { content: [], isLast: false };
    const { container } = render(
      <AgentProgressIndicator isRunning={true} message={message} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders "Thinking..." while the thread is running and no content has streamed', () => {
    const message = { content: [], isLast: true };
    render(<AgentProgressIndicator isRunning={true} message={message} />);
    expect(screen.getByText('Thinking...')).toBeVisible();
  });

  it('renders the tool name while a tool call is in flight', () => {
    const message = {
      content: [{ type: 'tool-call', toolName: 'get_hosts' }],
      isLast: true,
    };
    render(<AgentProgressIndicator isRunning={true} message={message} />);
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
      const message = cancelled();
      render(<AgentProgressIndicator isRunning={false} message={message} />);

      expect(screen.getByText('Response stopped.')).toBeVisible();
      expect(screen.queryByLabelText('Loading')).toBeNull();
    });

    it.each([
      { label: 'a later answer exists', overrides: { isLast: false } },
      {
        label: 'the answer got some text out',
        overrides: { content: [{ type: 'text', text: 'half an answer' }] },
      },
    ])('keeps the mark when $label', ({ overrides }) => {
      const message = cancelled(overrides);
      render(<AgentProgressIndicator isRunning={false} message={message} />);

      expect(screen.getByText('Response stopped.')).toBeVisible();
    });

    it('stopped mark takes precedence over thinking', () => {
      const message = cancelled();
      render(<AgentProgressIndicator isRunning={true} message={message} />);

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
    const message = {
      content: [],
      isLast: true,
      status,
    };
    const { container } = render(
      <AgentProgressIndicator isRunning={false} message={message} />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
