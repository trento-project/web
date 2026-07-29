// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  describe('Clearing AI Configuration', () => {
    it('"Clear Settings" button should be disabled when there is no AI configuration', () => {
      render(<AIConfiguration />);

      expect(
        screen.queryByLabelText('ai-configuration-clear-button')
      ).toBeDisabled();
    });

    it('"Clear Settings" button should be enabled when there is AI configuration', () => {
      const aiConfiguration = aiConfigurationFactory.build();
      render(<AIConfiguration aiConfiguration={aiConfiguration} />);

      expect(
        screen.getByLabelText('ai-configuration-clear-button')
      ).toBeEnabled();
    });

    it('should open confirmation modal and call onClear on confirm', async () => {
      const user = userEvent.setup();
      const onClear = jest.fn().mockResolvedValue();
      const aiConfiguration = aiConfigurationFactory.build();

      await act(() =>
        render(
          <AIConfiguration
            aiConfiguration={aiConfiguration}
            onClear={onClear}
          />
        )
      );

      await user.click(screen.getByLabelText('ai-configuration-clear-button'));

      expect(screen.getByText('Clear AI Configuration')).toBeInTheDocument();

      await user.click(screen.getByLabelText('confirm-clear-ai-settings'));

      expect(onClear).toHaveBeenCalled();
    });

    it('should close confirmation modal on cancel without calling onClear', async () => {
      const user = userEvent.setup();
      const onClear = jest.fn();
      const aiConfiguration = aiConfigurationFactory.build();

      await act(() =>
        render(
          <AIConfiguration
            aiConfiguration={aiConfiguration}
            onClear={onClear}
          />
        )
      );

      await user.click(screen.getByLabelText('ai-configuration-clear-button'));

      expect(screen.getByText('Clear AI Configuration')).toBeInTheDocument();

      await user.click(screen.getByText('Cancel'));

      expect(onClear).not.toHaveBeenCalled();
    });
  });
});
