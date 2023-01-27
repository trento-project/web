import React from 'react';
import { render, screen } from '@testing-library/react';
import PageHeader from '.';
import '@testing-library/jest-dom';

describe('PageHeader', () => {
  it('should render a header with the correct text', () => {
    render(<PageHeader>Hello World</PageHeader>);
    expect(screen.getByText('Hello World')).toBeVisible();
  });

  it('should render a header with provided props', () => {
    render(<PageHeader className="some-class">Hello World</PageHeader>);
    expect(screen.getByText('Hello World')).toHaveClass('some-class');
  });
});
