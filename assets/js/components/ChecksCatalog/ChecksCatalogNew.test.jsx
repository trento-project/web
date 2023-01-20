import React from 'react';

import { screen, within, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import { faker } from '@faker-js/faker';
import { withState, renderWithRouter } from '@lib/test-utils';
import { catalogCheckFactory } from '@lib/test-utils/factories';

import { ChecksCatalogNew } from './ChecksCatalogNew';




describe('ChecksCatalog ChecksCatalogNew component', () => {

  const stateCatalog =() => {
    const groupName1 = faker.animal.cat();
    const groupName2 = faker.animal.cat();
    const groupName3 = faker.animal.cat();
    const groupName4 = faker.animal.cat();
    const groupName5 = faker.animal.cat();
    const group1 = catalogCheckFactory.buildList(5, { group: groupName1, provider: "aws" });
    const group2 = catalogCheckFactory.buildList(5, { group: groupName2, provider: "azure" });
    const group3 = catalogCheckFactory.buildList(5, { group: groupName3, provider: "gcp" });
    const group4 = catalogCheckFactory.buildList(5, { group: groupName4, provider: "nutanix" });
    const group5 = catalogCheckFactory.buildList(5, { group: groupName5, provider: "kvm" });
    const catalog = group1.concat(group2, group3, group4, group5)

  
    const initialState = {
      catalogNew: { loading: false, data: catalog, error: null },
    };
    const [statefulCatalog, store] = withState(
      <ChecksCatalogNew />,
      initialState
    );
  return {statefulCatalog,store}
  }


  it('should render the checks catalog with fetched data', async () => {

    const { statefulCatalog, store } = stateCatalog();
    await act(async () => renderWithRouter(statefulCatalog));

    const groups = await waitFor(() => screen.getAllByRole('list'));
    expect(groups.length).toBe(5);

    groups.forEach((group) => {
      const { getAllByRole } = within(group);
      const checks = getAllByRole('listitem');
      expect(checks.length).toBe(5);
    });

    const actions = store.getActions();
    const expectedActions = [
      {
        type: 'UPDATE_CATALOG_NEW',
        payload: {},
      },
    ];
    expect(actions).toEqual(expectedActions);
  });



  it("should render the catalog only for aws", async () => {
  
  
  
  }
  )


  it("should render the catalog only for azure", async () => {
  
  
  
  }
  )

  it("should render the catalog only for gcp", async () => {
  
  
  
  }
  )

  it("should render the catalog only for nutanix", async () => {
  
  
  
  }
  )

  it("should render the catalog only for kvm", async () => {
  
  
  
  }
  )
});
