import React from 'react';
import { faker } from '@faker-js/faker';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { capitalize } from 'lodash';

import AlertingSettingsModal from './AlertingSettingsModal';

describe("AlertingSettingsModal", () => {
  it("renders correctly when opened with no arguments passed", async () => {
    await act(() => {
      render(<AlertingSettingsModal open />)
    });

    const alertingEnabled = screen.getByRole('checkbox', {name: "Send Email Alerts"})
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
               settings={{
                 smtpServer: smtpServer,
                 smtpPort: smtpPort,
                 smtpUsername: smtpUsername,
                 senderEmail: senderEmail,
                 recipientEmail: recipientEmail,
               }}
               open />)
    });

    expect(screen.getByRole('textbox', {name: "SMTP Server *"})).toHaveDisplayValue(smtpServer)
    expect(screen.getByRole('textbox', {name: "SMTP Port *"})).toHaveDisplayValue(smtpPort.toString())
    expect(screen.getByRole('textbox', {name: "SMTP Username *"})).toHaveDisplayValue(smtpUsername)
    expect(screen.getByLabelText(/^SMTP Password/)).toHaveTextContent("•••••")
    expect(screen.getByRole('textbox', {name: "Alert Sender *"})).toHaveDisplayValue(senderEmail)
    expect(screen.getByRole('textbox', {name: "Alert Recipient *"})).toHaveDisplayValue(recipientEmail)
  })

  it.skip("TODO calls save handler correctly when supplying fresh settings", async () => {});

  it.skip("TODO calls save handler with what changed", async () => {});

  it("renders errors correctly", async () => {
    const smtpServerDetails = faker.lorem.words()
    const smtpPortDetails = faker.lorem.words()
    const smtpUsernameDetails = faker.lorem.words()
    const senderEmailDetails = faker.lorem.words()
    const recipientEmailDetails = faker.lorem.words()

    function _construct_error_message(pointer, errorDetails) {
      return {
        detail: errorDetails,
        source: { pointer: `/${pointer}`},
        title: 'Invalid value',
      }
    };

    const errors = [
      _construct_error_message("smtpServer", smtpServerDetails),
      _construct_error_message("smtpPort", smtpPortDetails),
      _construct_error_message("smtpUsername", smtpUsernameDetails),
      _construct_error_message("senderEmail", senderEmailDetails),
      _construct_error_message("recipientEmail", recipientEmailDetails),
    ]

    await act(() => {
      render(<AlertingSettingsModal
               settings={{
                 smtpServer: faker.internet.domainName(),
                 smtpPort: faker.number.int({min: 1, max: 65535}),
                 smtpUsername: faker.internet.username(),
                 senderEmail: faker.internet.email(),
                 recipientEmail: faker.internet.email(),
               }}
               errors={errors}
               open />)
    });

    expect(screen.getByRole('alert', {name: "smtp-server-input-error"})).toHaveTextContent(capitalize(smtpServerDetails))
    expect(screen.getByRole('alert', {name: "smtp-port-input-error"})).toHaveTextContent(capitalize(smtpPortDetails))
    expect(screen.getByRole('alert', {name: "smtp-username-input-error"})).toHaveTextContent(capitalize(smtpUsernameDetails))
    expect(screen.getByRole('alert', {name: "sender-email-input-error"})).toHaveTextContent(capitalize(senderEmailDetails))
    expect(screen.getByRole('alert', {name: "recipient-email-input-error"})).toHaveTextContent(capitalize(recipientEmailDetails))
  });
});
