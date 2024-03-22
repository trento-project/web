import React from 'react';
import { faker } from '@faker-js/faker';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { capitalize } from 'lodash';

import SuseManagerSettingsModal from '.';

describe('SuseManagerSettingsModal component', () => {
  it('renders correctly', async () => {
    await act(async () => {
      render(
        <SuseManagerSettingsModal open onSave={() => {}} onChange={() => {}} />
      );
    });

    expect(screen.getByText('SUSE Manager URL')).toBeVisible();
    expect(screen.getByText('Username')).toBeVisible();
    expect(screen.getByText('Password')).toBeVisible();
    expect(screen.getAllByRole('textbox').length).toBe(3);

    expect(
      screen.getByPlaceholderText('Enter a SUSE Manager password')
    ).toBeVisible();
  });

  it('renders previous settings', async () => {
    const initialUrl = faker.internet.url();
    const initialUsername = faker.word.noun();
    const certUploadDate = faker.date.recent();

    await act(async () => {
      render(
        <SuseManagerSettingsModal
          open
          initialUrl={initialUrl}
          initialUsername={initialUsername}
          certUploadDate={certUploadDate}
          onSave={() => {}}
          onCancel={() => {}}
        />
      );
    });

    expect(screen.getByText('Certificate Uploaded')).toBeVisible();
    expect(screen.getByText('•••••')).toBeVisible();
    expect(
      screen.queryByPlaceholderText('Enter a SUSE Manager password')
    ).not.toBeInTheDocument();
  });

  it('should try to save all the fields', async () => {
    const user = userEvent.setup();
    const url = faker.internet.url();
    const username = faker.word.noun();
    const password = faker.word.noun();
    const certificate = faker.lorem.text();
    const onSave = jest.fn();

    await act(async () => {
      render(
        <SuseManagerSettingsModal open onSave={onSave} onCancel={() => {}} />
      );
    });

    const urlInput = screen.getByPlaceholderText('Enter a URL');
    const passwordInput = screen.getByPlaceholderText(
      'Enter a SUSE Manager password'
    );
    const userInput = screen.getByPlaceholderText(
      'Enter a SUSE Manager username'
    );
    const certificateInput = screen.getByPlaceholderText(
      'Starts with -----BEGIN CERTIFICATE-----'
    );

    await user.type(urlInput, url);
    await user.type(passwordInput, password);
    await user.type(certificateInput, certificate);
    await user.type(userInput, username);

    await user.click(screen.getByText('Save Settings'));

    expect(onSave).toHaveBeenCalledWith({
      username,
      url,
      password,
      ca_cert: certificate,
    });
  });

  it('should attempt saving only what changed', async () => {
    const user = userEvent.setup();
    const url = faker.internet.url();
    const username = faker.word.noun();
    const onSave = jest.fn();

    await act(async () => {
      render(
        <SuseManagerSettingsModal
          initialUsername={faker.word.noun()}
          initialUrl={faker.internet.url()}
          certUploadDate={faker.date.recent()}
          open
          onSave={onSave}
          onCancel={() => {}}
        />
      );
    });

    const urlInput = screen.getByPlaceholderText('Enter a URL');
    const userInput = screen.getByPlaceholderText(
      'Enter a SUSE Manager username'
    );

    await user.clear(urlInput);
    await user.clear(userInput);

    await user.type(urlInput, url);
    await user.type(userInput, username);

    await user.click(screen.getByText('Save Settings'));

    expect(onSave).toHaveBeenCalledWith({
      username,
      url,
    });
  });

  it('should display errors', async () => {
    const onSave = jest.fn();

    const detail = capitalize(faker.lorem.words(5));

    const errors = [
      {
        detail,
        source: { pointer: '/url' },
        title: 'Invalid value',
      },
      {
        detail,
        source: { pointer: '/ca_cert' },
        title: 'Invalid value',
      },
    ];

    await act(async () => {
      render(
        <SuseManagerSettingsModal
          initialUsername={faker.word.noun()}
          initialUrl={faker.internet.url()}
          errors={errors}
          open
          onSave={onSave}
          onCancel={() => {}}
        />
      );
    });

    expect(screen.getAllByText(detail)).toHaveLength(2);
  });
});
