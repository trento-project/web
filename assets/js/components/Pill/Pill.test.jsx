import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import Pill from '.';

describe('Pill', () => {
  it('should display a pill with default styles', () => {
    render(<Pill>Content</Pill>);
    expect(screen.getByText('Content')).toHaveClass(
      'inline-flex leading-5 font-semibold bg-green-100 text-green-800 rounded-full px-2 py-1 text-sm'
    );
  });

  it('should display a pill with provided props', () => {
    render(
      <Pill className="some-class" roundedMode="not-rounded" size="xs">
        Content
      </Pill>
    );
    expect(screen.getByText('Content')).toHaveClass(
      'inline-flex leading-5 font-semibold some-class not-rounded px-2 text-xs'
    );
  });
});
