import React from 'react';

import { screen, within, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { faker } from '@faker-js/faker';
import { catalogCheckFactory } from '@lib/test-utils/factories';

import ChecksCatalog from './ChecksCatalog';

describe('ChecksCatalog ChecksCatalog component', () => {
  it('should render the checks catalog with fetched data', () => {
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

    groups.forEach((group) => {
      const { getAllByRole } = within(group);
      const checks = getAllByRole('listitem');
      expect(checks.length).toBe(5);
    });

    expect(mockUpdateCatalog).toHaveBeenCalledWith('all');
  });

  it('should query the catalog with the correct provider', async () => {
    const user = userEvent.setup();

    const catalogData = catalogCheckFactory.buildList(5);
    const mockUpdateCatalog = jest.fn();

    render(
      <ChecksCatalog
        catalogData={catalogData}
        updateCatalog={mockUpdateCatalog}
      />
    );

    await user.click(screen.getByText('All'));

    const providerFilter = screen.getByText('AWS');

    await user.click(providerFilter);

    expect(mockUpdateCatalog).toHaveBeenNthCalledWith(1, 'all');
    expect(mockUpdateCatalog).toHaveBeenNthCalledWith(2, 'aws');
  });
});
