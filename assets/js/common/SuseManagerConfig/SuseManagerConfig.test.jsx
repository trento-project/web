import React from 'react';
import { faker } from '@faker-js/faker';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import SuseManagerConfig from '.';

describe('SuseManagerConfig', () => {
  it('renders a default state', () => {
    render(<SuseManagerConfig />);

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
      />
    );
    expect(screen.getByLabelText('test-suma-connection')).toBeEnabled();

    const testConnectionButton = screen.getByText('Test Connection');
    await user.click(testConnectionButton);
    expect(onTestConnection).toHaveBeenCalled();
  });
});
