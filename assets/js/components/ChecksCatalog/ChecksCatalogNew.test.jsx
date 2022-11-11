import React from 'react';

import { screen, within, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import { faker } from '@faker-js/faker';
import { withState, renderWithRouter } from '@lib/test-utils';
import { catalogCheckFactory } from '@lib/test-utils/factories';

import { ChecksCatalogNew } from './ChecksCatalogNew';

describe('ChecksCatalog ChecksCatalogNew component', () => {
  it('should render the checks catalog with fetched data', async () => {
    const groupName1 = faker.animal.cat();
    const groupName2 = faker.animal.cat();
    const group1 = catalogCheckFactory.buildList(5, { group: groupName1 });
    const group2 = catalogCheckFactory.buildList(5, { group: groupName2 });
    const catalog = group1.concat(group2);

    const initialState = {
      catalog_new: { loading: false, data: catalog, error: null },
    };
    const [statefulCatalog] = withState(<ChecksCatalogNew />, initialState);

    await act(async () => renderWithRouter(statefulCatalog));

    const groups = await waitFor(() => screen.getAllByRole('list'));
    expect(groups.length).toBe(2);

    for (let group of groups) {
      let { getAllByRole } = within(group);
      let checks = getAllByRole('listitem');
      expect(checks.length).toBe(5);
    }
  });
});
