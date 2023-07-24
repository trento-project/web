import React from 'react';

import { screen, within, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { faker } from '@faker-js/faker';
import { withState, renderWithRouter } from '@lib/test-utils';
import { catalogCheckFactory } from '@lib/test-utils/factories';

import ChecksCatalog from './ChecksCatalog';

describe('ChecksCatalog ChecksCatalog component', () => {
  it('should render the checks catalog with fetched data', async () => {
    const groupName1 = faker.datatype.uuid();
    const groupName2 = faker.datatype.uuid();
    const group1 = catalogCheckFactory.buildList(5, { group: groupName1 });
    const group2 = catalogCheckFactory.buildList(5, { group: groupName2 });

    const initialState = {
      catalog: { loading: false, data: [...group1, ...group2], error: null },
    };
    const [statefulCatalog, store] = withState(<ChecksCatalog />, initialState);

    await act(async () => renderWithRouter(statefulCatalog));

    const groups = await waitFor(() => screen.getAllByRole('list'));
    expect(groups.length).toBe(2);

    groups.forEach((group) => {
      const { getAllByRole } = within(group);
      const checks = getAllByRole('listitem');
      expect(checks.length).toBe(5);
    });

    const actions = store.getActions();
    const expectedActions = [
      {
        type: 'UPDATE_CATALOG',
        payload: {},
      },
    ];
    expect(actions).toEqual(expectedActions);
  });

  it('should query the catalog with the correct provider', async () => {
    const user = userEvent.setup();

    const catalog = catalogCheckFactory.buildList(5);

    const initialState = {
      catalog: { loading: false, data: catalog, error: null },
    };

    const [statefulCatalog, store] = withState(<ChecksCatalog />, initialState);

    await act(async () => renderWithRouter(statefulCatalog, store));

    await user.click(screen.getByText('All'));

    const providerFilter = screen.getByText('AWS');

    await user.click(providerFilter);

    const actions = store.getActions();
    const expectedActions = [
      {
        type: 'UPDATE_CATALOG',
        payload: {},
      },
      {
        type: 'UPDATE_CATALOG',
        payload: { provider: 'aws', target_type: 'cluster' },
      },
    ];
    expect(actions).toEqual(expectedActions);
  });
});
