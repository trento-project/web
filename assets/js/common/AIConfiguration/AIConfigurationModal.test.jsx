import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { aiConfigurationFactory } from '@lib/test-utils/factories';
import { REQUIRED_FIELD_TEXT } from '@lib/forms';

import AIConfigurationModal from './AIConfigurationModal';

describe('AIConfigurationModal', () => {
  const aiProviders = {
    googleai: ['gemini-2.5-pro', 'gemini-1.5-pro'],
    openai: ['gpt-4o', 'gpt-4-turbo'],
  };

  it('should render empty form', () => {
    render(<AIConfigurationModal open aiProviders={aiProviders} />);

    expect(screen.getByText('AI Configuration')).toBeVisible();
    expect(screen.getByText('Select Provider')).toBeVisible();
    expect(screen.getByText('Model')).toBeVisible();
    expect(screen.getByText('API Key')).toBeVisible();

    expect(screen.getByText('Select an AI Provider')).toBeVisible();
    expect(screen.getByText('None')).toBeVisible();
    expect(screen.getByPlaceholderText('Enter API key')).toBeVisible();

    expect(
      screen.getByRole('button', { name: 'Save AI Configuration' })
    ).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled();
  });

  it('should render with saved configuration', () => {
    const aiConfiguration = aiConfigurationFactory.build({
      provider: 'googleai',
      model: 'gemini-2.5-pro',
    });

    render(
      <AIConfigurationModal
        open
        aiProviders={aiProviders}
        aiConfiguration={aiConfiguration}
      />
    );

    expect(screen.getByText('Google Gemini')).toBeVisible();
    expect(screen.getByText('gemini-2.5-pro')).toBeVisible();
    expect(screen.getByPlaceholderText('Change API Key')).toBeVisible();

    expect(
      screen.getByRole('button', { name: 'Save AI Configuration' })
    ).toBeDisabled();
  });

  it('should enable Save button when a Provider is selected', async () => {
    const user = userEvent.setup();
    render(<AIConfigurationModal open aiProviders={aiProviders} />);

    // Select Provider
    await user.click(screen.getByText('Select an AI Provider'));
    await user.click(screen.getByText('Google Gemini'));

    // Model should be auto-selected to first option
    expect(screen.getByText('gemini-2.5-pro')).toBeVisible();

    // It becomes enabled because a Provider changed, and it validates on submission.
    expect(
      screen.getByRole('button', { name: 'Save AI Configuration' })
    ).toBeEnabled();

    // Type API Key
    await user.type(screen.getByPlaceholderText('Enter API key'), 'my-api-key');

    expect(
      screen.getByRole('button', { name: 'Save AI Configuration' })
    ).toBeEnabled();
  });

  it('should call onSave when new config is submitted', async () => {
    const user = userEvent.setup();
    const onSave = jest.fn();

    render(
      <AIConfigurationModal open aiProviders={aiProviders} onSave={onSave} />
    );

    // Select Provider
    await user.click(screen.getByText('Select an AI Provider'));
    await user.click(screen.getByText('Google Gemini'));

    // Type API Key
    await user.type(screen.getByPlaceholderText('Enter API key'), 'my-api-key');

    await user.click(
      screen.getByRole('button', { name: 'Save AI Configuration' })
    );

    expect(onSave).toHaveBeenCalledWith(
      'googleai',
      'gemini-2.5-pro',
      'my-api-key'
    );
  });

  it('should call onUpdate when config is updated', async () => {
    const user = userEvent.setup();
    const onUpdate = jest.fn();
    const aiConfiguration = aiConfigurationFactory.build({
      provider: 'googleai',
      model: 'gemini-2.5-pro',
    });

    render(
      <AIConfigurationModal
        open
        aiProviders={aiProviders}
        aiConfiguration={aiConfiguration}
        onUpdate={onUpdate}
      />
    );

    // Type new API Key
    await user.type(
      screen.getByPlaceholderText('Change API Key'),
      'new-api-key'
    );

    await user.click(
      screen.getByRole('button', { name: 'Save AI Configuration' })
    );

    expect(onUpdate).toHaveBeenCalledWith(undefined, undefined, 'new-api-key');
  });

  it('should show required validation error if API key is empty when creating', async () => {
    const user = userEvent.setup();
    const onSave = jest.fn();

    render(
      <AIConfigurationModal open aiProviders={aiProviders} onSave={onSave} />
    );

    // Select Provider
    await user.click(screen.getByText('Select an AI Provider'));
    await user.click(screen.getByText('Google Gemini'));

    await user.click(
      screen.getByRole('button', { name: 'Save AI Configuration' })
    );

    expect(screen.getByText(REQUIRED_FIELD_TEXT)).toBeVisible();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('should call onCancel when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();

    render(
      <AIConfigurationModal
        open
        aiProviders={aiProviders}
        onCancel={onCancel}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalled();
  });

  it('should display errors from the backend', async () => {
    const errors = [
      {
        detail: 'Invalid API Key format',
        source: { pointer: '/api_key' },
        title: 'Invalid value',
      },
    ];

    render(
      <AIConfigurationModal open aiProviders={aiProviders} errors={errors} />
    );

    expect(
      await screen.findByText('Invalid API Key format', { exact: false })
    ).toBeVisible();
  });
});
