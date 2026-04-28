import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { MessageBubble } from './MessageBubble';

describe('MessageBubble', () => {
  it('renders the "You" label and the user bubble background for the user role', () => {
    const { container } = render(<MessageBubble variant="user">Hello</MessageBubble>);
    expect(screen.getByText('You')).toBeVisible();
    expect(container.firstChild).toHaveClass('bg-[#e8f5ef]');
    expect(screen.getByText('Hello')).toBeVisible();
  });

  it('renders the assistant bubble without the "You" label', () => {
    const { container } = render(<MessageBubble variant="assistant">Sure!</MessageBubble>);
    expect(screen.queryByText('You')).toBeNull();
    expect(container.firstChild).toHaveClass('bg-white');
    expect(screen.getByText('Sure!')).toBeVisible();
  });

  it('falls back to the assistant style for an unknown role', () => {
    const { container } = render(<MessageBubble variant="other">x</MessageBubble>);
    expect(container.firstChild).toHaveClass('bg-white');
    expect(screen.queryByText('You')).toBeNull();
  });

  it('renders rich children inside the bubble', () => {
    render(
      <MessageBubble variant="assistant">
        <p>Step 1.</p>
        <p>Step 2.</p>
      </MessageBubble>
    );
    expect(screen.getByText('Step 1.')).toBeVisible();
    expect(screen.getByText('Step 2.')).toBeVisible();
  });
});
