import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { alertingSettingsFactory } from '@lib//test-utils/factories/alertingSettings';

import AlertingSettingsConfig, {
  ENFORCED_FROM_ENV_MESSAGE,
} from './AlertingSettingsConfig';

const adminUser = [{ name: 'all', resource: 'all' }];

describe('AlertingSettingsConfig', () => {
  it('renders all visual props when called with default arguments', () => {
    render(<AlertingSettingsConfig />);

    expect(screen.getByLabelText('smtp-server')).toHaveTextContent(
      'https://...'
    );
    expect(screen.getByLabelText('smtp-port')).toHaveTextContent('587');
    expect(screen.getByLabelText('smtp-username')).toHaveTextContent('...');
    expect(screen.getByLabelText('smtp-password')).toHaveTextContent('•••••');
    expect(screen.getByLabelText('alerting-sender')).toHaveTextContent(
      '...@...'
    );
    expect(screen.getByLabelText('alerting-recipient')).toHaveTextContent(
      '...@...'
    );
    expect(screen.getByLabelText('alerting-enabled')).toHaveTextContent(
      'Disabled'
    );
  });

  it('renders all visual props supplied as arguments', () => {
    const alertingSettings = alertingSettingsFactory.build();
    const { smtpServer, smtpPort, smtpUsername, senderEmail, recipientEmail } =
      alertingSettings;

    render(<AlertingSettingsConfig settings={alertingSettings} />);

    expect(screen.getByLabelText('smtp-server')).toHaveTextContent(smtpServer);
    expect(screen.getByLabelText('smtp-port')).toHaveTextContent(
      smtpPort.toString()
    );
    expect(screen.getByLabelText('smtp-username')).toHaveTextContent(
      smtpUsername
    );
    expect(screen.getByLabelText('smtp-password')).toHaveTextContent('•••••');
    expect(screen.getByLabelText('alerting-sender')).toHaveTextContent(
      senderEmail
    );
    expect(screen.getByLabelText('alerting-recipient')).toHaveTextContent(
      recipientEmail
    );
    expect(screen.getByLabelText('alerting-enabled')).toHaveTextContent(
      'Enabled'
    );
  });

  it.each`
    case                        | abilities
    ${'not set'}                | ${undefined}
    ${'empty list'}             | ${[]}
    ${'non-relevant abilities'} | ${[{ name: 'all', resource: 'some_resource' }]}
  `(
    'forbids editing when user has not sufficient abilities ($case)',
    async ({ abilities }) => {
      const onEditClick = jest.fn();
      const user = userEvent.setup();

      render(
        <AlertingSettingsConfig
          onEditClick={onEditClick}
          userAbilities={abilities}
        />
      );

      const editButton = screen.getByLabelText('alerting-edit-button');
      expect(editButton).toBeDisabled();

      await user.click(editButton);
      expect(onEditClick).not.toHaveBeenCalled();

      await user.hover(editButton);
      expect(
        screen.queryByText('You are not authorized for this action')
      ).toBeVisible();
    }
  );

  it.each`
    case                       | abilities
    ${'admin'}                 | ${adminUser}
    ${'all:alerting_settings'} | ${[{ name: 'all', resource: 'alerting_settings' }]}
  `(
    'allows editing when user has sufficient abilities ($case) and calls correct handler',
    async ({ abilities }) => {
      const onEditClick = jest.fn();
      const user = userEvent.setup();

      render(
        <AlertingSettingsConfig
          onEditClick={onEditClick}
          userAbilities={abilities}
        />
      );

      expect(screen.getByLabelText('alerting-edit-button')).toBeEnabled();

      await user.click(screen.getByLabelText('alerting-edit-button'));
      expect(onEditClick).toHaveBeenCalledTimes(1);
    }
  );

  it('disables editing when settings are enforced from application env', async () => {
    const onEditClick = jest.fn();
    const user = userEvent.setup();

    render(
      <AlertingSettingsConfig
        settings={alertingSettingsFactory.build({ enforcedFromEnv: true })}
        onEditClick={onEditClick}
        userAbilities={adminUser}
      />
    );

    const editButton = screen.getByLabelText('alerting-edit-button');
    expect(editButton).toBeDisabled();

    await user.click(editButton);
    expect(onEditClick).not.toHaveBeenCalled();

    await user.hover(editButton);
    expect(screen.queryByText(ENFORCED_FROM_ENV_MESSAGE)).toBeVisible();
  });
});
