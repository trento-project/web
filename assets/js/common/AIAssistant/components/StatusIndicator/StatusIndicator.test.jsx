import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { StatusIndicator } from './StatusIndicator';

describe('StatusIndicator', () => {
  it.each(['Thinking...', 'Calling get_hosts...', 'Preparing response...'])(
    'renders the "%s" label',
    (label) => {
      render(<StatusIndicator label={label} />);
      expect(screen.getByText(label)).toBeVisible();
    }
  );

  it('renders a spinner alongside the label', () => {
    const { container } = render(<StatusIndicator label="Thinking..." />);
    expect(
      container.querySelector('svg, [role="status"], .animate-spin')
    ).not.toBeNull();
  });
});
