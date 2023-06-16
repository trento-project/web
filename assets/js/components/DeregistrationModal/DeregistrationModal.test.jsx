import React from 'react';
import { render, screen } from '@testing-library/react';
import { faker } from '@faker-js/faker';

import DeregistrationModal from '.';

describe('Deregistration Modal component', () => {
  it('should render deregistration modal correctly', async () => {
    const hostName = faker.name.firstName();

    render(
      <DeregistrationModal
        hostName={hostName}
        isOpen
        onCleanUp={() => {}}
        onClose={() => {}}
      />
    );

    expect(await screen.findByText(new RegExp(hostName))).toBeTruthy();
    expect(
      await screen.findByRole('button', { name: /Clean up/i })
    ).toBeTruthy();
    expect(await screen.findByRole('button', { name: /Cancel/i })).toBeTruthy();
  });
});
