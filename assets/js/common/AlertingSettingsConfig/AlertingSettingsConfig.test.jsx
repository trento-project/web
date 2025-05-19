import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { faker } from '@faker-js/faker';
import * as lodash from 'lodash';

import AlertingSettingsConfig, {
  ENFORCED_FROM_ENV_MESSAGE,
} from './AlertingSettingsConfig';

const adminUser = [{ name: 'all', resource: 'all' }];

describe('AlertingSettingsConfig', () => {
  beforeAll(() => {
    jest.restoreAllMocks();
  });

  it('renders all visual props when called with default arguments', () => {
    render(<AlertingSettingsConfig />);

    expect(screen.getByLabelText('smtp-server')).toHaveTextContent(
      'https://...'
    );
    expect(screen.getByLabelText('smtp-port')).toHaveTextContent('587');
    expect(screen.getByLabelText('smtp-username')).toHaveTextContent('...');
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

  it('renders all visual props supplied as arugments', () => {
    const alertingEnabled = true;
    const smtpServer = faker.internet.url();
    const smtpPort = faker.number.int({ max: 60000 });
    const smtpUsername = faker.animal.cow();
    const senderEmail = faker.internet.email();
    const recipientEmail = faker.internet.email();

    render(
      <AlertingSettingsConfig
        settings={{
          alertingEnabled,
          smtpServer,
          smtpPort,
          smtpUsername,
          senderEmail,
          recipientEmail,
        }}
      />
    );

    expect(screen.getByLabelText('smtp-server')).toHaveTextContent(smtpServer);
    expect(screen.getByLabelText('smtp-port')).toHaveTextContent(
      smtpPort.toString()
    );
    expect(screen.getByLabelText('smtp-username')).toHaveTextContent(
      smtpUsername
    );
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

  it('forbids editing when called with default arguments', async () => {
    var spy = jest.spyOn(lodash, 'noop');
    const user = userEvent.setup();

    render(<AlertingSettingsConfig />);

    const editButton = screen.getByLabelText('alerting-edit-button');
    expect(editButton).toBeDisabled();

    await user.click(editButton);
    expect(spy).not.toHaveBeenCalled();

    await user.hover(editButton);
    expect(
      screen.queryByText('You are not authorized for this action')
    ).toBeVisible();
  });

  it('allows editing when user has sufficient abilities and calls correct handler', async () => {
    const onEditClick = jest.fn();
    const user = userEvent.setup()

    render(
      <AlertingSettingsConfig
        onEditClick={onEditClick}
        userAbilities={adminUser}
      />
    );

    expect(screen.getByLabelText('alerting-edit-button')).toBeEnabled();

    await user.click(screen.getByLabelText('alerting-edit-button'));
    expect(onEditClick).toHaveBeenCalledTimes(1);
  });

  it('disables editing when settings are enforced from application env', async () => {
    const onEditClick = jest.fn();
    const user = userEvent.setup();

    render(
      <AlertingSettingsConfig
        settings={{ enforcedFromEnv: true }}
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
