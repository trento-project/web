import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { aiConfigurationFactory } from '@lib/test-utils/factories';

import AIConfiguration from './AIConfiguration';

describe('AIConfiguration', () => {
  it('should show empty AI configuration', () => {
    render(<AIConfiguration />);

    expect(screen.getByText('AI Configuration')).toBeVisible();
    expect(
      screen.getByText('Settings used by Liz, your AI Assistant.')
    ).toBeVisible();
    expect(screen.getByText('Model Provider')).toBeVisible();
    expect(screen.getByText('Model')).toBeVisible();
    expect(screen.getByText('API Key')).toBeVisible();
    expect(screen.getAllByText('None')).toHaveLength(2);
    expect(screen.getByText('Not set')).toBeVisible();
  });

  it('should show saved AI configuration', () => {
    const aiConfiguration = aiConfigurationFactory.build({
      provider: 'googleai',
      model: 'gemini-2.5-pro',
    });
    render(<AIConfiguration aiConfiguration={aiConfiguration} />);

    expect(screen.getByText('Google Gemini')).toBeVisible();
    expect(screen.getByText('gemini-2.5-pro')).toBeVisible();
    expect(screen.getByText('••••••••')).toBeVisible();
  });

  it('should show unmapped provider and model', () => {
    const aiConfiguration = aiConfigurationFactory.build({
      provider: 'custom_provider',
      model: 'custom_model',
    });
    render(<AIConfiguration aiConfiguration={aiConfiguration} />);

    expect(screen.getByText('custom_provider')).toBeVisible();
    expect(screen.getByText('custom_model')).toBeVisible();
  });
});
