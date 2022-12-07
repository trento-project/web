import React from 'react';
import '@testing-library/jest-dom';
import { aboutFactory } from '@lib/test-utils/factories';
import { act, screen } from '@testing-library/react';
import { renderWithRouter } from '@lib/test-utils';
import AboutPage from './AboutPage';

describe('AboutPage component', () => {
  const apiRequestData = aboutFactory.build();
  it('should render the about page with content from the api', async () => {
    await act(async () => {
      renderWithRouter(
        <AboutPage onFetch={() => Promise.resolve({ data: apiRequestData })} />
      );
    });

    expect(screen.getByText(apiRequestData.flavor)).toBeTruthy();
    expect(screen.getByText(apiRequestData.version)).toBeTruthy();
    expect(
      screen.getByText(`${apiRequestData.sles_subscriptions} found`)
    ).toBeTruthy();
  });

  it('should render the about page with default values if api get request fails', async () => {
    const stateValues = { flavor: 'N/A', subscriptions: 0, version: 'v0.0.0' };
    const errorMessage = { messages: "Get request '/api/about' failed" };
    jest.spyOn(console, 'error').mockImplementation(() => null);

    await act(async () => {
      renderWithRouter(
        <AboutPage onFetch={() => Promise.reject(errorMessage)} />
      );
    });

    expect(screen.getByText(stateValues.flavor)).toBeTruthy();
    expect(screen.getByText(stateValues.version)).toBeTruthy();
    expect(screen.getByText(`${stateValues.subscriptions} found`)).toBeTruthy();
  });
});
