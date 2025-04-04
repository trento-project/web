import React from 'react';
import { faker } from '@faker-js/faker';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { capitalize } from 'lodash';

import AlertingSettingsModal from './AlertingSettingsModal';

function construct_error_message(pointer, errorDetails) {
  return {
    detail: errorDetails,
    source: { pointer: `/${pointer}`},
    title: 'Invalid value',
  }
};

function make_fake_return_errors_on_save({
  smtpServerError,
  smtpPortError,
  smtpUsernameError,
  smtpPasswordError,
  senderEmailError,
  recipientEmailError
}) {
  return (_settings) => {
    var errors = []
    smtpServerError && errors.push(
      construct_error_message("smtp_server", smtpServerError)
    )
    smtpPortError && errors.push(
      construct_error_message("smtp_port", smtpPortError)
    )
    smtpUsernameError && errors.push(
      construct_error_message("smtp_username", smtpUsernameError)
    )
    smtpPasswordError && errors.push(
      construct_error_message("smtp_password", smtpPasswordError)
    )
    senderEmailError && errors.push(
      construct_error_message("sender_email", senderEmailError)
    )
    recipientEmailError && errors.push(
      construct_error_message("recipient_email", recipientEmailError)
    )

    throw {
      response: {
        data: errors
      }
    }
  }
};

describe("AlertingSettingsModal", () => {
  it("renders correctly when opened with no arguments passed", async () => {
    await act(() => {
      render(<AlertingSettingsModal open />)
    });

    const alertingEnabled = screen.getByRole('switch', {name: "Send Email Alerts"})
    expect(alertingEnabled).not.toBeChecked()

    const smtpServer = screen.getByRole('textbox', {name: "SMTP Server *"})
    expect(smtpServer).toHaveAttribute("placeholder", "Enter a URL")
    expect(smtpServer).toHaveTextContent("")

    const smtpPort = screen.getByRole('textbox', {name: "SMTP Port *"})
    expect(smtpPort).toHaveAttribute("placeholder", "587")
    expect(smtpPort).toHaveTextContent("")

    const smtpUsername = screen.getByRole('textbox', {name: "SMTP Username *"})
    expect(smtpUsername).toHaveAttribute("placeholder", "Enter SMTP Username")
    expect(smtpUsername).toHaveTextContent("")

    const smtpPassword = screen.getByLabelText(/^SMTP Password/, {selector: ":placeholder-shown"})
    expect(smtpPassword).toHaveAttribute("placeholder", "Enter SMTP Password")

    const emailSender = screen.getByRole('textbox', {name: "Alert Sender *"})
    expect(emailSender).toHaveAttribute("placeholder", "Enter an email address")
    expect(emailSender).toHaveTextContent("")

    const emailRecipient = screen.getByRole('textbox', {name: "Alert Recipient *"})
    expect(emailRecipient).toHaveAttribute("placeholder", "Enter an email address")
    expect(emailRecipient).toHaveTextContent("")
  })

  it("renders correctly when opened with supplied settings arg", async () => {
    const smtpServer = faker.internet.domainName()
    const smtpPort = faker.number.int({min: 1, max: 65535})
    const smtpUsername = faker.internet.username()
    const senderEmail = faker.internet.email()
    const recipientEmail = faker.internet.email()

    await act(() => {
      render(<AlertingSettingsModal
               previousSettings={{
                 alertingEnabled: true,
                 smtpServer: smtpServer,
                 smtpPort: smtpPort,
                 smtpUsername: smtpUsername,
                 senderEmail: senderEmail,
                 recipientEmail: recipientEmail,
               }}
               open />)
    });

    expect(screen.getByRole('switch', {name: "Send Email Alerts"})).toBeChecked()
    expect(screen.getByRole('textbox', {name: "SMTP Server *"})).toHaveDisplayValue(smtpServer)
    expect(screen.getByRole('textbox', {name: "SMTP Port *"})).toHaveDisplayValue(smtpPort.toString())
    expect(screen.getByRole('textbox', {name: "SMTP Username *"})).toHaveDisplayValue(smtpUsername)
    expect(screen.getByLabelText(/^SMTP Password/)).toHaveTextContent("•••••")
    expect(screen.getByRole('textbox', {name: "Alert Sender *"})).toHaveDisplayValue(senderEmail)
    expect(screen.getByRole('textbox', {name: "Alert Recipient *"})).toHaveDisplayValue(recipientEmail)
  })

  it("calls save handler correctly when supplying fresh settings", async () => {
    const smtpServer = faker.internet.domainName();
    const smtpPort = faker.number.int({min: 1, max: 65535});
    const smtpUsername = faker.internet.username();
    const smtpPassword = faker.internet.password()
    const senderEmail = faker.internet.email();
    const recipientEmail = faker.internet.email();

    const user = userEvent.setup();
    const onSave = jest.fn()

    render(<AlertingSettingsModal open onSave={onSave} />);

    await user.click(screen.getByRole("switch", "Email Alerts"));
    await user.type(screen.getByRole('textbox', {name: "SMTP Server *"}), smtpServer);
    await user.type(screen.getByRole('textbox', {name: "SMTP Port *"}), smtpPort.toString());
    await user.type(screen.getByRole('textbox', {name: "SMTP Username *"}), smtpUsername);
    await user.type(screen.getByLabelText(/^SMTP Password/), smtpPassword);
    await user.type(screen.getByRole('textbox', {name: "Alert Sender *"}), senderEmail);
    await user.type(screen.getByRole('textbox', {name: "Alert Recipient *"}), recipientEmail);
    await user.click(screen.getByRole("button", {name: "Save Settings"}))

    expect(onSave).toBeCalledWith({
      enabled: true,
      smtp_server: smtpServer,
      smtp_port: smtpPort.toString(),
      smtp_username: smtpUsername,
      smtp_password: smtpPassword,
      sender_email: senderEmail,
      recipient_email: recipientEmail,
    })
  });

  it("does not supply password to save handler by default when previous settings", async () => {
    const smtpServer = faker.internet.domainName()
    const smtpPort = faker.number.int({min: 1, max: 65535})
    const smtpUsername = faker.internet.username()
    const senderEmail = faker.internet.email()
    const recipientEmail = faker.internet.email()

    const user = userEvent.setup();
    const onSave = jest.fn()

    render(
      <AlertingSettingsModal
        previousSettings={{
          alertingEnabled: true,
          smtpServer: smtpServer,
          smtpPort: smtpPort,
          smtpUsername: smtpUsername,
          senderEmail: senderEmail,
          recipientEmail: recipientEmail,
        }}
        open
        onSave={onSave}
      />
    )
    await user.click(screen.getByRole("button", {name: "Save Settings"}))

    expect(onSave).toBeCalledTimes(1)
    expect(onSave.mock.calls[0][0]).not.toHaveProperty("password")
  });

  it("renders errors correctly", async () => {
    const smtpServerError = faker.lorem.words()
    const smtpPortError = faker.lorem.words()
    const smtpUsernameError = faker.lorem.words()
    const senderEmailError = faker.lorem.words()
    const recipientEmailError = faker.lorem.words()

    onSaveFake = make_fake_return_errors_on_save({
      smtpServerError,
      smtpPortError,
      smtpUsernameError,
      senderEmailError,
      recipientEmailError
    })

    const user = userEvent.setup()

    render(
      <AlertingSettingsModal
        open
        previousSettings={{
          smtpServer: faker.internet.domainName(),
          smtpPort: faker.number.int({min: 1, max: 65535}),
          smtpUsername: faker.internet.username(),
          senderEmail: faker.internet.email(),
          recipientEmail: faker.internet.email(),
        }}
        onSave={onSaveFake}
      />
    );
    await user.click(screen.getByRole('button', {name: "Save Settings"}));

    expect(screen.getByRole('alert', {name: "smtp-server-input-error"})).toHaveTextContent(
      capitalize(smtpServerError)
    )
    expect(screen.getByRole('alert', {name: "smtp-port-input-error"})).toHaveTextContent(
      capitalize(smtpPortError)
    )
    expect(screen.getByRole('alert', {name: "smtp-username-input-error"})).toHaveTextContent(capitalize(
      smtpUsernameError)
    )
    expect(screen.getByRole('alert', {name: "sender-email-input-error"})).toHaveTextContent(
      capitalize(senderEmailError)
    )
    expect(screen.getByRole('alert', {name: "recipient-email-input-error"})).toHaveTextContent(capitalize(
      recipientEmailError)
    )
  });
});
