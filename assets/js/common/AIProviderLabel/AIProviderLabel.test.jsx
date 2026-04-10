import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AIProviderLabel from './AIProviderLabel';

describe('AI Provider Label', () => {
  it('should display an icon and label with Google AI as the provider', () => {
    const { container } = render(<AIProviderLabel provider="googleai" />);
    expect(screen.getAllByText(/Google Gemini/)).toBeTruthy();
    expect(container.querySelector('img').getAttribute('alt')).toContain(
      'googleai'
    );
  });

  it('should display an icon and label with OpenAI as the provider', () => {
    const { container } = render(<AIProviderLabel provider="openai" />);
    expect(screen.getAllByText(/OpenAI/)).toBeTruthy();
    expect(container.querySelector('img').getAttribute('alt')).toContain(
      'openai'
    );
  });
  it('should display an icon and label with Anthropic as the provider', () => {
    const { container } = render(<AIProviderLabel provider="anthropic" />);
    expect(screen.getAllByText(/Anthropic/)).toBeTruthy();
    expect(container.querySelector('img').getAttribute('alt')).toContain(
      'anthropic'
    );
  });

  it('should display an element containing an unmapped AI provider', () => {
    render(<AIProviderLabel provider="unmapped-provider" />);
    expect(screen.getAllByText(/unmapped-provider/)).toBeTruthy();
    expect(screen.getByTestId('eos-svg-component')).toBeVisible();
  });
});
