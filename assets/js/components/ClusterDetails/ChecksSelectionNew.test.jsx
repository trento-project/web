import React from 'react';

import { screen, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { faker } from '@faker-js/faker';
import { withState, renderWithRouter } from '@lib/test-utils';
import { catalogCheckFactory, clusterFactory } from '@lib/test-utils/factories';

import ChecksSelectionNew from './ChecksSelectionNew';

describe('ClusterDetails ChecksSelectionNew component', () => {
  it('should change individual check switches accordingly if the group switch is clicked', async () => {
    const group = faker.animal.cat();
    const catalog = catalogCheckFactory.buildList(2, { group: group });
    const cluster = clusterFactory.build();

    const initialState = {
      catalogNew: { loading: false, data: catalog, error: null },
      clusterChecksSelection: {},
    };
    const [statefulChecksSelection] = withState(
      <ChecksSelectionNew clusterId={cluster.id} cluster={cluster} />,
      initialState
    );

    await act(async () => renderWithRouter(statefulChecksSelection));

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

    const initialState = {
      catalogNew: { loading: false, data: catalog, error: null },
      clusterChecksSelection: {},
    };
    const [statefulChecksSelection] = withState(
      <ChecksSelectionNew clusterId={cluster.id} cluster={cluster} />,
      initialState
    );

    await act(async () => renderWithRouter(statefulChecksSelection));

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

  it('should dispatch selected checks message when the save button is clicked', async () => {
    const catalog = catalogCheckFactory.buildList(2);
    const selectedChecks = [catalog[0].id, catalog[1].id];
    const cluster = clusterFactory.build({
      selected_checks: selectedChecks,
    });

    const initialState = {
      catalogNew: { loading: false, data: catalog, error: null },
      clusterChecksSelection: {},
    };
    const [statefulChecksSelection, store] = withState(
      <ChecksSelectionNew clusterId={cluster.id} cluster={cluster} />,
      initialState
    );

    await act(async () => renderWithRouter(statefulChecksSelection));

    await waitFor(() => screen.getAllByRole('heading'));

    const saveButton = screen.getByRole('button');
    userEvent.click(saveButton);

    const actions = store.getActions();
    const expectedActions = [
      {
        type: 'UPDATE_CATALOG_NEW',
        payload: {},
      },
      {
        type: 'CHECKS_SELECTED',
        payload: {
          checks: selectedChecks,
          clusterID: cluster.id,
        },
      },
    ];
    expect(actions).toEqual(expect.arrayContaining(expectedActions));
  });
});
