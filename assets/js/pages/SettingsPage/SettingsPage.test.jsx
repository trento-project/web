import React from 'react';

import { format } from 'date-fns';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import {
  withState,
  defaultInitialState,
  renderWithRouter,
} from '@lib/test-utils';
import { softwareUpdatesSettingsFactory } from '@lib/test-utils/factories/softwareUpdatesSettings';

import SettingsPage from './SettingsPage';

describe('Settings Page', () => {
  it('should render a loading box while fetching settings', async () => {
    const [StatefulSettings] = withState(<SettingsPage />, {
      ...defaultInitialState,
      softwareUpdatesSettings: {
        loading: true,
        settings: {
          url: undefined,
          username: undefined,
          ca_uploaded_at: undefined,
        },
      },
    });

    renderWithRouter(StatefulSettings);

    expect(screen.getByText('Loading Settings...')).toBeVisible();
  });

  it('should render an empty SUSE Manager Config Section', async () => {
    const [StatefulSettings] = withState(<SettingsPage />, {
      ...defaultInitialState,
      softwareUpdatesSettings: {
        loading: false,
        settings: {
          url: undefined,
          username: undefined,
          ca_uploaded_at: undefined,
        },
        error: null,
      },
    });

    renderWithRouter(StatefulSettings);

    expect(screen.getByText('SUSE Manager URL')).toBeVisible();
    expect(screen.getByText('https://')).toBeVisible();

    expect(screen.getByText('CA Certificate')).toBeVisible();
    expect(screen.getByText('-')).toBeVisible();

    expect(screen.getByText('Username')).toBeVisible();
    expect(screen.getByText('Password')).toBeVisible();

    expect(screen.queryAllByText('.....')).toHaveLength(2);
  });

  it('should render SUSE Manager Config Section with configured settings', async () => {
    const settings = softwareUpdatesSettingsFactory.build();

    const [StatefulSettings] = withState(<SettingsPage />, {
      ...defaultInitialState,
      softwareUpdatesSettings: {
        loading: false,
        settings,
        error: null,
      },
    });

    const { url, username, ca_uploaded_at } = settings;

    renderWithRouter(StatefulSettings);

    expect(screen.getByText('SUSE Manager URL')).toBeVisible();
    expect(screen.getByText(url)).toBeVisible();

    expect(screen.getByText('CA Certificate')).toBeVisible();
    expect(screen.getByText('Certificate Uploaded')).toBeVisible();
    expect(
      screen.getByText(format(ca_uploaded_at, "'Uploaded:' dd MMM y"))
    ).toBeVisible();

    expect(screen.getByText('Username')).toBeVisible();
    expect(screen.getByText(username)).toBeVisible();

    expect(screen.getByText('Password')).toBeVisible();
    expect(screen.getByText('•••••')).toBeVisible();
  });
});
