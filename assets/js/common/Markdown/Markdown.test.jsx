import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Markdown from './Markdown';

describe('Markdown Component', () => {
  test('renders with default markdown class', () => {
    const { container } = render(<Markdown>Test content</Markdown>);
    expect(screen.getByText('Test content')).toBeInTheDocument();
    const markdownDiv = container.firstChild;
    expect(markdownDiv).toHaveClass('markdown');
  });

  test('renders with custom className', () => {
    const { container } = render(
      <Markdown className="custom-class1 custom-class2">Test content</Markdown>
    );
    expect(screen.getByText('Test content')).toBeInTheDocument();
    const markdownDiv = container.firstChild;
    expect(markdownDiv).toHaveClass('markdown');
    expect(markdownDiv).toHaveClass('custom-class1');
    expect(markdownDiv).toHaveClass('custom-class2');
  });
});
