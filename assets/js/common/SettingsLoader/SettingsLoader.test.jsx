import React from 'react';
import { faker } from '@faker-js/faker';

import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom';

import SettingsLoader, {
  Status as SettingsLoaderStatus,
  calculateStatus,
} from '.';

describe('SettingsLoader component', () => {
  it('should render the loading box', () => {
    const text = faker.lorem.paragraph();

    render(
      <SettingsLoader>
        <p>{text}</p>
      </SettingsLoader>
    );

    expect(screen.getByText(text)).toBeVisible();
  });

  it('should render the notification box in loading state', () => {
    render(<SettingsLoader status={SettingsLoaderStatus.LOADING} />);

    expect(screen.getByText('Loading Settings...')).toBeVisible();
  });

  it('should render the notification box with connection error', () => {
    render(<SettingsLoader status={SettingsLoaderStatus.ERROR} />);

    expect(screen.getByText('Connection Error')).toBeVisible();
    expect(
      screen.getByText(
        'Unable to load Settings. Please try reloading this section.'
      )
    ).toBeVisible();
    expect(screen.getByRole('button')).toHaveTextContent('Reload');
  });

  it.each`
    input             | expected
    ${[true, true]}   | ${SettingsLoaderStatus.LOADING}
    ${[true, false]}  | ${SettingsLoaderStatus.LOADING}
    ${[false, true]}  | ${SettingsLoaderStatus.ERROR}
    ${[false, false]} | ${SettingsLoaderStatus.READY}
  `('should calculate $expected', ({ input, expected }) => {
    expect(calculateStatus(...input)).toBe(expected);
  });
});
