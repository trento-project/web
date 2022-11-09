import React from 'react';

import { screen, within, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { faker } from '@faker-js/faker';
import { renderWithRouter } from '@lib/test-utils';
import { catalogCheckFactory } from '@lib/test-utils/factories';

import { ChecksCatalogNew } from './ChecksCatalogNew';

const wandaURL = process.env.WANDA_URL;
const axiosMock = new MockAdapter(axios);

describe('ChecksCatalog ChecksCatalogNew component', () => {
  beforeEach(() => {
    axiosMock.reset();
  });

  it('should render the checks catalog with fetched data', async () => {
    const groupName1 = faker.animal.cat();
    const groupName2 = faker.animal.cat();
    const group1 = catalogCheckFactory.buildList(5, { group: groupName1 });
    const group2 = catalogCheckFactory.buildList(5, { group: groupName2 });
    const catalog = group1.concat(group2);

    axiosMock.onGet(`${wandaURL}/api/checks/catalog`).reply(200, {
      items: catalog,
    });

    await act(async () => renderWithRouter(<ChecksCatalogNew />));

    const groups = await waitFor(() => screen.getAllByRole('list'));
    expect(groups.length).toBe(2);

    for (let group of groups) {
      let { getAllByRole } = within(group);
      let checks = getAllByRole('listitem');
      expect(checks.length).toBe(5);
    }
  });
});
