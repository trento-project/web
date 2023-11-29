import React from 'react';

import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { faker } from '@faker-js/faker';
import { catalogCheckFactory } from '@lib/test-utils/factories';

import ChecksCatalog from './ChecksCatalog';

describe('ChecksCatalog ChecksCatalog component', () => {
  it('should render the checks catalog with fetched data', async () => {
    const user = userEvent.setup();

    const groupName1 = faker.string.uuid();
    const groupName2 = faker.string.uuid();
    const group1 = catalogCheckFactory.buildList(5, { group: groupName1 });
    const group2 = catalogCheckFactory.buildList(5, { group: groupName2 });
    const catalogData = group1.concat(group2);

    const mockUpdateCatalog = jest.fn();

    render(
      <ChecksCatalog
        catalogData={catalogData}
        updateCatalog={mockUpdateCatalog}
      />
    );

    const groups = screen.getAllByRole('list');
    expect(groups.length).toBe(2);

    // first group checks are expanded initially
    const checks1 = screen.getAllByRole('listitem');
    expect(checks1.length).toBe(5);

    await user.click(screen.getByText(groupName2));
    const checks2 = screen.getAllByRole('listitem');
    expect(checks2.length).toBe(10);

    expect(mockUpdateCatalog).toHaveBeenCalledWith({
      selectedClusterType: 'all',
      selectedProvider: 'all',
      selectedTargetType: 'all',
    });
  });

  it('should query the catalog with the correct filters', async () => {
    const user = userEvent.setup();

    const catalogData = catalogCheckFactory.buildList(5);
    const mockUpdateCatalog = jest.fn();

    render(
      <ChecksCatalog
        catalogData={catalogData}
        updateCatalog={mockUpdateCatalog}
      />
    );

    await user.click(screen.getByText('All providers'));
    await user.click(screen.getByText('AWS'));

    await user.click(screen.getByText('All targets'));
    await user.click(screen.getByText('Clusters'));

    await user.click(screen.getByText('All cluster types'));
    await user.click(screen.getByText('ASCS/ERS', { exact: false }));

    expect(mockUpdateCatalog).toHaveBeenNthCalledWith(1, {
      selectedClusterType: 'all',
      selectedProvider: 'all',
      selectedTargetType: 'all',
    });
    expect(mockUpdateCatalog).toHaveBeenNthCalledWith(2, {
      selectedClusterType: 'all',
      selectedProvider: 'aws',
      selectedTargetType: 'all',
    });
    expect(mockUpdateCatalog).toHaveBeenNthCalledWith(3, {
      selectedClusterType: 'all',
      selectedProvider: 'aws',
      selectedTargetType: 'cluster',
    });
    // TODO: possibly re-enable this test once the catalog is updated with asc_ers checks
    // expect(mockUpdateCatalog).toHaveBeenNthCalledWith(4, {
    //   selectedClusterType: 'ascs_ers',
    //   selectedProvider: 'aws',
    //   selectedTargetType: 'cluster',
    // });
  });
});
