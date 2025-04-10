import React from 'react';
import { screen, act } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { networkClient } from '@lib/network';
import '@testing-library/jest-dom';

import { faker } from '@faker-js/faker';

import {
  renderWithRouterMatch,
  defaultInitialState,
  withState,
} from '@lib/test-utils';
import { advisoryErrataFactory } from '@lib/test-utils/factories';

import AdvisoryDetailsPage from '.';

describe('Advisory Details Page', () => {
  it('should render correctly', async () => {
    const axiosMock = new MockAdapter(networkClient);

    const hostID = faker.string.uuid();
    const advisoryName = faker.string.uuid();
    const errata = advisoryErrataFactory.build();

    axiosMock
      .onGet(`/api/v1/software_updates/errata_details/${advisoryName}`)
      .reply(200, errata);

    const [StatefulPage] = withState(
      <AdvisoryDetailsPage />,
      defaultInitialState
    );

    await act(async () => {
      renderWithRouterMatch(StatefulPage, {
        path: 'hosts/:hostID/patches/:advisoryID',
        route: `/hosts/${hostID}/patches/${advisoryName}`,
      });
    });

    expect(screen.getByText(advisoryName)).toBeVisible();
  });

  it('should render errors', async () => {
    const axiosMock = new MockAdapter(networkClient);

    const hostID = faker.string.uuid();
    const advisoryName = faker.string.uuid();
    const errata = advisoryErrataFactory.build();

    axiosMock
      .onGet(`/api/v1/software_updates/errata_details/${advisoryName}`)
      .reply(422, errata);

    const [StatefulPage] = withState(
      <AdvisoryDetailsPage />,
      defaultInitialState
    );

    await act(async () => {
      renderWithRouterMatch(StatefulPage, {
        path: 'hosts/:hostID/patches/:advisoryID',
        route: `/hosts/${hostID}/patches/${advisoryName}`,
      });
    });

    expect(screen.getByText('Sorry')).toBeVisible();
  });
});
