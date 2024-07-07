import React from 'react';
import { faker } from '@faker-js/faker';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import SuseManagerConfig from '.';

const adminUser = [{ name: 'all', resource: 'all' }];
const sumaSettingsPermittedFor = ['all:suma_settings'];

describe('SuseManagerConfig', () => {
  it('renders a default state', () => {
    render(
      <SuseManagerConfig
        userAbilities={adminUser}
        permitted={sumaSettingsPermittedFor}
      />
    );

    expect(screen.getByText('https://')).toBeInTheDocument();
    expect(screen.getAllByText('-')).toHaveLength(1);
    expect(screen.getAllByText('.....')).toHaveLength(2);
    expect(screen.getByLabelText('test-suma-connection')).toBeDisabled();
  });

  it('renders settings', async () => {
    const user = userEvent.setup();

    const certUploadDate = faker.date.anytime();
    const url = faker.internet.url();
    const username = faker.animal.cat();
    const onEditClick = jest.fn();

    render(
      <SuseManagerConfig
        url={url}
        username={username}
        certUploadDate={certUploadDate}
        onEditClick={onEditClick}
        userAbilities={adminUser}
        permitted={sumaSettingsPermittedFor}
      />
    );

    expect(screen.getByText(url)).toBeInTheDocument();
    expect(screen.getByText(username)).toBeInTheDocument();
    expect(screen.getByText('•••••')).toBeInTheDocument();
    expect(screen.getByText('Certificate Uploaded')).toBeInTheDocument();

    const editSettingsButton = screen.getByText('Edit Settings');
    await user.click(editSettingsButton);
    expect(onEditClick).toHaveBeenCalled();
  });

  it('allows testing connection', async () => {
    const user = userEvent.setup();

    const onTestConnection = jest.fn();

    render(
      <SuseManagerConfig
        url={faker.internet.url()}
        username={faker.animal.cat()}
        certUploadDate={faker.date.anytime()}
        testConnectionEnabled
        onTestConnection={onTestConnection}
        userAbilities={adminUser}
        permitted={sumaSettingsPermittedFor}
      />
    );
    expect(screen.getByLabelText('test-suma-connection')).toBeEnabled();

    const testConnectionButton = screen.getByText('Test Connection');
    await user.click(testConnectionButton);
    expect(onTestConnection).toHaveBeenCalled();
  });

  it('renders default state without ability to edit or clear settings', async () => {
    const userWithoutPermission = [{ name: '', resource: '' }];
    const user = userEvent.setup();
    const onEditClick = jest.fn();
    const onClearClick = jest.fn();
    render(
      <SuseManagerConfig
        userAbilities={userWithoutPermission}
        permitted={sumaSettingsPermittedFor}
        onEditClick={onEditClick}
        onClearClick={onClearClick}
      />
    );

    expect(screen.getByText('Edit Settings')).toBeDisabled();
    await user.click(screen.getByText('Edit Settings'));
    expect(onEditClick).not.toHaveBeenCalled();
    await user.hover(screen.getByText('Edit Settings'));
    expect(
      screen.queryAllByText('You are not authorized for this action')[0]
    ).toBeVisible();

    expect(screen.getByText('Clear Settings')).toBeDisabled();
    await user.click(screen.getByText('Clear Settings'));
    expect(onClearClick).not.toHaveBeenCalled();
    await user.hover(screen.getByText('Clear Settings'));
    expect(
      screen.queryAllByText('You are not authorized for this action')[1]
    ).toBeVisible();
  });
});
