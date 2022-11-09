import React from 'react';

import { screen, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { faker } from '@faker-js/faker';
import { withState, renderWithRouter } from '@lib/test-utils';
import { catalogCheckFactory, clusterFactory } from '@lib/test-utils/factories';

import ChecksSelectionNew from './ChecksSelectionNew';

const wandaURL = process.env.WANDA_URL;

describe('ClusterDetails ChecksSelectionNew component', () => {
  const axiosMock = new MockAdapter(axios);

  beforeEach(() => {
    axiosMock.reset();
  });

  it('should change individual check switches accordingly if the group switch is clicked', async () => {
    const group = faker.animal.cat();
    const catalog = catalogCheckFactory.buildList(2, { group: group });
    const cluster = clusterFactory.build();

    axiosMock.onGet(`${wandaURL}/api/checks/catalog`).reply(200, {
      items: catalog,
    });

    await act(async () => {
      const [StatefulCheckSelection] = withState(
        <ChecksSelectionNew clusterId={cluster.id} cluster={cluster} />
      );
      renderWithRouter(StatefulCheckSelection);
    });

    const groupItem = await waitFor(() => screen.getByRole('heading'));

    userEvent.click(groupItem.parentNode);
    const switches = screen.getAllByRole('switch');

    expect(switches[0]).not.toBeChecked();
    expect(switches[1]).not.toBeChecked();
    expect(switches[2]).not.toBeChecked();

    userEvent.click(switches[0]);

    expect(switches[1]).toBeChecked();
    expect(switches[2]).toBeChecked();

    userEvent.click(switches[0]);

    expect(switches[1]).not.toBeChecked();
    expect(switches[2]).not.toBeChecked();
  });

  it('should change group check switch accordingly if the children check switches are clicked', async () => {
    const group = faker.animal.cat();
    const catalog = catalogCheckFactory.buildList(2, { group: group });
    const cluster = clusterFactory.build({
      selected_checks: [catalog[0].id, catalog[1].id],
    });

    axiosMock.onGet(`${wandaURL}/api/checks/catalog`).reply(200, {
      items: catalog,
    });

    await act(async () => {
      const [StatefulCheckSelection] = withState(
        <ChecksSelectionNew clusterId={cluster.id} cluster={cluster} />
      );
      renderWithRouter(StatefulCheckSelection);
    });

    const groupItem = await waitFor(() => screen.getByRole('heading'));

    userEvent.click(groupItem.parentNode);
    const switches = screen.getAllByRole('switch');

    expect(switches[0]).toBeChecked();
    expect(switches[1]).toBeChecked();
    expect(switches[2]).toBeChecked();

    userEvent.click(switches[1]);

    expect(switches[0]).not.toBeChecked();
    expect(switches[0].classList.contains('bg-green-300')).toBe(true);

    userEvent.click(switches[2]);

    expect(switches[0]).not.toBeChecked();
  });
});
