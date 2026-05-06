// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { ThreadWelcome } from './ThreadWelcome';

describe('ThreadWelcome', () => {
  it('renders the default Liz greeting when no greeting is provided', () => {
    render(<ThreadWelcome />);
    expect(screen.getByText("Hi, I'm Liz.")).toBeVisible();
    expect(screen.getByText('How can I help you today?')).toBeVisible();
  });

  it('renders a custom greeting when provided', () => {
    render(<ThreadWelcome greeting={<div>Welcome back.</div>} />);
    expect(screen.getByText('Welcome back.')).toBeVisible();
    expect(screen.queryByText("Hi, I'm Liz.")).toBeNull();
  });

  it('renders suggestion children inside the suggestions container', () => {
    render(
      <ThreadWelcome>
        <button type="button">First</button>
        <button type="button">Second</button>
      </ThreadWelcome>
    );
    expect(screen.getByRole('button', { name: 'First' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Second' })).toBeVisible();
  });

  it('omits the suggestions container when no children are provided', () => {
    const { container } = render(<ThreadWelcome />);
    expect(container.querySelectorAll('button')).toHaveLength(0);
  });
});
