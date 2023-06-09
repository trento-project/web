import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Spinner from './Spinner';

describe('Spinner', () => {
  it('renders the spinner component with default props', () => {
    render(<Spinner />);
    const spinnerElement = screen.getByRole('alert');
    expect(spinnerElement).toBeInTheDocument();
    expect(spinnerElement).toHaveAttribute('aria-label', 'Loading');
    expect(spinnerElement.firstChild).toHaveClass('fill-jungle-green-500');
  });

  it('renders the spinner component with custom props', () => {
    render(
      <Spinner wrapperClassName="pt-12" size="xl" spinnerColor="fill-blue" />
    );
    const spinnerElement = screen.getByRole('alert');
    expect(spinnerElement).toBeInTheDocument();
    expect(spinnerElement).toHaveAttribute('aria-label', 'Loading');
    expect(spinnerElement).toHaveClass('pt-12');
    expect(spinnerElement.firstChild).toHaveClass('fill-blue');
    expect(spinnerElement.firstChild).toHaveAttribute('width', '32');
  });
});
