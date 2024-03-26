import React from 'react';
import { faker } from '@faker-js/faker';

import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom';

import SuseManagerSettingsContainer from './SuseManagerSettingsContainer';

describe('ChecksCatalog CatalogContainer component', () => {
  it('should render the loading box', () => {
    const text = faker.lorem.paragraph();

    render(
      <SuseManagerSettingsContainer>
        <p>{text}</p>
      </SuseManagerSettingsContainer>
    );

    expect(screen.getByText(text)).toBeVisible();
  });

  it('should render the notification box in loading state', () => {
    render(<SuseManagerSettingsContainer loading />);

    expect(screen.getByText('Loading Settings...')).toBeVisible();
  });

  it('should render the notification box with connection error', () => {
    render(<SuseManagerSettingsContainer error />);

    expect(screen.getByText('Connection Error')).toBeVisible();
    expect(
      screen.getByText(
        'Unable to load SUSE Manager configuration. Please try reloading this section.'
      )
    ).toBeVisible();
    expect(screen.getByRole('button')).toHaveTextContent('Reload');
  });
});
