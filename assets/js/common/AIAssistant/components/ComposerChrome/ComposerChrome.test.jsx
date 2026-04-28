import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { ComposerChrome } from './ComposerChrome';

describe('ComposerChrome', () => {
  it('renders the inputSlot inside the input region', () => {
    render(
      <ComposerChrome
        inputSlot={<textarea aria-label="composer-input" />}
        actionSlot={<button type="submit">Send</button>}
      />
    );
    expect(screen.getByLabelText('composer-input')).toBeVisible();
  });

  it('renders the actionSlot in the footer row when provided', () => {
    render(
      <ComposerChrome
        inputSlot={<textarea aria-label="composer-input" />}
        actionSlot={<button type="submit">Send</button>}
      />
    );
    expect(screen.getByRole('button', { name: 'Send' })).toBeVisible();
  });

  it('omits the actionSlot when none is provided', () => {
    render(<ComposerChrome inputSlot={<textarea aria-label="composer-input" />} />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('renders the default footnote with the documentation link', () => {
    render(<ComposerChrome inputSlot={<textarea aria-label="composer-input" />} />);
    expect(screen.getByText(/AI assistants can make mistakes/)).toBeVisible();
    expect(screen.getByRole('link', { name: 'Learn more' })).toHaveAttribute(
      'href',
      expect.stringContaining('documentation.suse.com')
    );
  });

  it('renders a custom footnote when provided', () => {
    render(
      <ComposerChrome
        inputSlot={<textarea aria-label="composer-input" />}
        footnote={<span>Custom note.</span>}
      />
    );
    expect(screen.getByText('Custom note.')).toBeVisible();
    expect(screen.queryByText(/AI assistants can make mistakes/)).toBeNull();
  });
});
