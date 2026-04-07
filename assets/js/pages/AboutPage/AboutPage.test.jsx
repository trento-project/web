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

    expect(screen.getByText(apiRequestData.version)).toBeTruthy();
    expect(
      screen.getByText(`${apiRequestData.sles_subscriptions} found`)
    ).toBeTruthy();
    expect(screen.getByText(apiRequestData.wanda_version)).toBeTruthy();
    expect(screen.getByText(apiRequestData.postgres_version)).toBeTruthy();
    expect(screen.getByText(apiRequestData.rabbitmq_version)).toBeTruthy();
    expect(screen.getByText(apiRequestData.prometheus_version)).toBeTruthy();
  });

  it('should render N/A when component versions are null', async () => {
    const dataWithNullVersions = {
      ...apiRequestData,
      wanda_version: null,
      postgres_version: null,
      rabbitmq_version: null,
      prometheus_version: null,
    };

    await act(async () => {
      renderWithRouter(
        <AboutPage
          onFetch={() => Promise.resolve({ data: dataWithNullVersions })}
        />
      );
    });

    const naElements = screen.getAllByText('N/A');
    expect(naElements).toHaveLength(4);
  });

  it('should render the about page with default values if api get request fails', async () => {
    const stateValues = { subscriptions: 0, version: 'v0.0.0' };
    const errorMessage = { messages: "Get request '/api/v1/about' failed" };
    jest.spyOn(console, 'error').mockImplementation(() => null);

    await act(async () => {
      renderWithRouter(
        <AboutPage onFetch={() => Promise.reject(errorMessage)} />
      );
    });

    expect(screen.getByText(stateValues.version)).toBeTruthy();
    expect(screen.getByText(`${stateValues.subscriptions} found`)).toBeTruthy();
  });
});
