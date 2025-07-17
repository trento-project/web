import React from 'react';
import { faker } from '@faker-js/faker';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { capitalize } from 'lodash';

import {
  alertingSettingsFactory,
  alertingSettingsSaveRequestFactory,
} from '@lib//test-utils/factories/alertingSettings';

import AlertingSettingsModal from './AlertingSettingsModal';

describe('AlertingSettingsModal', () => {
  it('renders correctly when opened with no arguments passed', async () => {
    await act(() => {
      render(<AlertingSettingsModal open />);
    });

    const alertingEnabled = screen.getByRole('switch', {
      name: 'Send Email Alerts',
    });
    expect(alertingEnabled).not.toBeChecked();

    const smtpServer = screen.getByRole('textbox', { name: 'SMTP Server *' });
    expect(smtpServer).toHaveAttribute('placeholder', 'Enter a URL');
    expect(smtpServer).toHaveTextContent('');

    const smtpPort = screen.getByRole('textbox', { name: 'SMTP Port *' });
    expect(smtpPort).toHaveAttribute('placeholder', '587');
    expect(smtpPort).toHaveTextContent('');

    const smtpUsername = screen.getByRole('textbox', {
      name: 'SMTP Username *',
    });
    expect(smtpUsername).toHaveAttribute('placeholder', 'Enter SMTP Username');
    expect(smtpUsername).toHaveTextContent('');

    const smtpPassword = screen.getByLabelText(/^SMTP Password/, {
      selector: ':placeholder-shown',
    });
    expect(smtpPassword).toHaveAttribute('placeholder', 'Enter SMTP Password');

    const emailSender = screen.getByRole('textbox', { name: 'Alert Sender *' });
    expect(emailSender).toHaveAttribute(
      'placeholder',
      'Enter an email address'
    );
    expect(emailSender).toHaveTextContent('');

    const emailRecipient = screen.getByRole('textbox', {
      name: 'Alert Recipient *',
    });
    expect(emailRecipient).toHaveAttribute(
      'placeholder',
      'Enter an email address'
    );
    expect(emailRecipient).toHaveTextContent('');
  });

  it('renders correctly when opened with supplied settings arg', async () => {
    const alertingSettings = alertingSettingsFactory.build();
    const { smtpServer, smtpPort, smtpUsername, senderEmail, recipientEmail } =
      alertingSettings;

    await act(() => {
      render(
        <AlertingSettingsModal previousSettings={alertingSettings} open />
      );
    });

    expect(
      screen.getByRole('switch', { name: 'Send Email Alerts' })
    ).toBeChecked();
    expect(
      screen.getByRole('textbox', { name: 'SMTP Server *' })
    ).toHaveDisplayValue(smtpServer);
    expect(
      screen.getByRole('textbox', { name: 'SMTP Port *' })
    ).toHaveDisplayValue(smtpPort.toString());
    expect(
      screen.getByRole('textbox', { name: 'SMTP Username *' })
    ).toHaveDisplayValue(smtpUsername);
    expect(screen.getByLabelText(/^SMTP Password/)).toHaveTextContent('•••••');
    expect(
      screen.getByRole('textbox', { name: 'Alert Sender *' })
    ).toHaveDisplayValue(senderEmail);
    expect(
      screen.getByRole('textbox', { name: 'Alert Recipient *' })
    ).toHaveDisplayValue(recipientEmail);
  });

  it('calls onSave handler correctly when supplying fresh settings', async () => {
    const {
      smtpServer,
      smtpPort,
      smtpUsername,
      smtpPassword,
      senderEmail,
      recipientEmail,
    } = alertingSettingsSaveRequestFactory.build();

    const user = userEvent.setup();
    const onSave = jest.fn();

    render(<AlertingSettingsModal open onSave={onSave} />);

    await user.click(screen.getByRole('switch', 'Email Alerts'));
    await user.type(
      screen.getByRole('textbox', { name: 'SMTP Server *' }),
      smtpServer
    );
    await user.type(
      screen.getByRole('textbox', { name: 'SMTP Port *' }),
      smtpPort.toString()
    );
    await user.type(
      screen.getByRole('textbox', { name: 'SMTP Username *' }),
      smtpUsername
    );
    await user.type(screen.getByLabelText(/^SMTP Password/), smtpPassword);
    await user.type(
      screen.getByRole('textbox', { name: 'Alert Sender *' }),
      senderEmail
    );
    await user.type(
      screen.getByRole('textbox', { name: 'Alert Recipient *' }),
      recipientEmail
    );
    await user.click(screen.getByRole('button', { name: 'Save Settings' }));

    expect(onSave).toHaveBeenCalledWith({
      alertingEnabled: true,
      smtpServer,
      smtpPort,
      smtpUsername,
      smtpPassword,
      senderEmail,
      recipientEmail,
    });
  });

  it('does not supply password to onSave handler by default when previous settings', async () => {
    const alertingSettings = alertingSettingsFactory.build();
    const { smtpServer, smtpPort, smtpUsername, senderEmail, recipientEmail } =
      alertingSettings;

    const user = userEvent.setup();
    const onSave = jest.fn();

    render(
      <AlertingSettingsModal
        previousSettings={alertingSettings}
        open
        onSave={onSave}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Save Settings' }));

    expect(onSave).toHaveBeenCalledWith({
      alertingEnabled: true,
      smtpServer,
      smtpPort,
      smtpUsername,
      // No `smtpPassword'
      senderEmail,
      recipientEmail,
    });
  });

  it('renders errors correctly', async () => {
    const constructErrorMessage = (pointer, errorDetails) => ({
      detail: errorDetails,
      source: { pointer: `/${pointer}` },
      title: 'Invalid value',
    });

    const smtpServerError = faker.lorem.words();
    const smtpPortError = faker.lorem.words();
    const smtpUsernameError = faker.lorem.words();
    const smtpPasswordError = faker.lorem.words();
    const senderEmailError = faker.lorem.words();
    const recipientEmailError = faker.lorem.words();

    const user = userEvent.setup();

    render(
      <AlertingSettingsModal
        open
        previousSettings={alertingSettingsFactory.build()}
        errors={[
          constructErrorMessage('smtp_server', smtpServerError),
          constructErrorMessage('smtp_port', smtpPortError),
          constructErrorMessage('smtp_username', smtpUsernameError),
          constructErrorMessage('smtp_password', smtpPasswordError),
          constructErrorMessage('sender_email', senderEmailError),
          constructErrorMessage('recipient_email', recipientEmailError),
        ]}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Remove' }));

    expect(
      screen.getByRole('alert', { name: 'smtp-server-input-error' })
    ).toHaveTextContent(capitalize(smtpServerError));
    expect(
      screen.getByRole('alert', { name: 'smtp-port-input-error' })
    ).toHaveTextContent(capitalize(smtpPortError));
    expect(
      screen.getByRole('alert', { name: 'smtp-username-input-error' })
    ).toHaveTextContent(capitalize(smtpUsernameError));
    expect(
      screen.getByRole('alert', { name: 'smtp-password-input-error' })
    ).toHaveTextContent(capitalize(smtpPasswordError));
    expect(
      screen.getByRole('alert', { name: 'sender-email-input-error' })
    ).toHaveTextContent(capitalize(senderEmailError));
    expect(
      screen.getByRole('alert', { name: 'recipient-email-input-error' })
    ).toHaveTextContent(capitalize(recipientEmailError));
  });
});
