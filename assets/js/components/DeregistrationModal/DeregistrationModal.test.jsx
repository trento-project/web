import React from 'react';
import { render, screen } from '@testing-library/react';
import { faker } from '@faker-js/faker';

import DeregistrationModal from '.';

describe('Deregistration Modal component', () => {
  it('should render deregistration modal correctly', async () => {
    const hostname = faker.name.firstName();

    render(
      <DeregistrationModal
        hostname={hostname}
        isOpen
        isError={false}
        onCleanUp={() => {}}
        onCancel={() => {}}
      />
    );

    expect(await screen.findByText(hostname, { exact: false })).toBeTruthy();
    expect(
      await screen.findByRole('button', { name: /Clean up/i })
    ).toBeTruthy();
    expect(await screen.findByRole('button', { name: /Cancel/i })).toBeTruthy();
    await expect(
      screen.findByText(
        `Error occurred when requesting deregistration of host ${hostname}`
      )
    ).rejects.toThrow();
  });

  it('should render deregistration modal correctly when error', async () => {
    window.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: () => null,
      disconnect: () => null,
    }));

    const hostname = faker.name.firstName();

    render(
      <DeregistrationModal
        hostname={hostname}
        isOpen
        isError
        onCleanUp={() => {}}
        onCancel={() => {}}
      />
    );

    expect(await screen.findByText(hostname, { exact: false })).toBeTruthy();
    expect(
      await screen.findByRole('button', { name: /Clean up/i })
    ).toBeTruthy();
    expect(await screen.findByRole('button', { name: /Cancel/i })).toBeTruthy();
    expect(
      await screen.findByText(
        `Error occurred when requesting deregistration of host`,
        { exact: false }
      )
    ).toBeTruthy();
  });
});
