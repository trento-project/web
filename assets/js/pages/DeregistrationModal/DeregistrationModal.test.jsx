import React from 'react';
import { render, screen } from '@testing-library/react';
import { faker } from '@faker-js/faker';

import { APPLICATION_TYPE, DATABASE_TYPE } from '@lib/model/sapSystems';
import { generateSid } from '@lib/test-utils/factories';

import DeregistrationModal from '.';

describe('Deregistration Modal component', () => {
  it('should render a host deregistration modal correctly', async () => {
    const hostname = faker.person.firstName();

    render(
      <DeregistrationModal
        hostname={hostname}
        isOpen
        onCleanUp={() => {}}
        onCancel={() => {}}
      />
    );

    expect(await screen.findByText(hostname, { exact: false })).toBeTruthy();
    expect(
      await screen.findByText(
        'This action will cause Trento to stop tracking',
        { exact: false }
      )
    ).toBeTruthy();
    expect(
      await screen.findByRole('button', { name: /Clean up/i })
    ).toBeTruthy();
    expect(await screen.findByRole('button', { name: /Cancel/i })).toBeTruthy();
  });

  it('should render an application instance deregistration modal correctly', async () => {
    const sid = generateSid();
    const instanceNumber = '00';

    render(
      <DeregistrationModal
        contentType={APPLICATION_TYPE}
        sid={sid}
        instanceNumber={instanceNumber}
        isOpen
        onCleanUp={() => {}}
        onCancel={() => {}}
      />
    );

    expect(await screen.findByText(sid, { exact: false })).toBeTruthy();
    expect(
      await screen.findByText(instanceNumber, { exact: false })
    ).toBeTruthy();
    expect(
      await screen.findByText('In the case of an ASCS instance', {
        exact: false,
      })
    ).toBeTruthy();
  });

  it('should render a database instance deregistration modal correctly', async () => {
    const sid = generateSid();
    const instanceNumber = '00';

    render(
      <DeregistrationModal
        contentType={DATABASE_TYPE}
        sid={sid}
        instanceNumber={instanceNumber}
        isOpen
        onCleanUp={() => {}}
        onCancel={() => {}}
      />
    );

    expect(await screen.findByText(sid, { exact: false })).toBeTruthy();
    expect(
      await screen.findByText(instanceNumber, { exact: false })
    ).toBeTruthy();
    expect(
      await screen.findByText('In the case of the last database instance', {
        exact: false,
      })
    ).toBeTruthy();
  });
});
