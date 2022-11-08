import React from 'react';

import { screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';

import { faker } from '@faker-js/faker';
import { renderWithRouter } from '@lib/test-utils';
import { catalogCheckFactory } from '@lib/test-utils/factories';

import CatalogContainer from './CatalogContainer';

describe('ChecksCatalog CatalogContainer component', () => {
  it('should render the notification box', () => {
    renderWithRouter(<CatalogContainer catalogError={'some error'} />);

    expect(screen.getByText('some error')).toBeVisible();
    expect(screen.getByRole('button')).toHaveTextContent('Try again');
  });

  it('should render the loading box', () => {
    renderWithRouter(<CatalogContainer loading={true} />);

    expect(screen.getByText('Loading checks catalog...')).toBeVisible();
  });

  it('should render an error message if the checks catalog is empty', () => {
    renderWithRouter(<CatalogContainer catalogData={[]} />);

    expect(screen.getByText('Checks catalog is empty.')).toBeVisible();
    expect(screen.getByRole('button')).toHaveTextContent('Try again');
  });

  it('should render the checks catalog', () => {
    const groupName1 = faker.animal.cat();
    const groupName2 = faker.animal.cat();
    const group1 = catalogCheckFactory.buildList(5, { group: groupName1 });
    const group2 = catalogCheckFactory.buildList(5, { group: groupName2 });
    const catalog = group1.concat(group2);

    renderWithRouter(
      <CatalogContainer
        loading={false}
        catalogError={null}
        catalogData={catalog}
      />
    );

    const groups = screen.getAllByRole('list');
    expect(groups.length).toBe(2);

    for (let group of groups) {
      let { getAllByRole } = within(group);
      let checks = getAllByRole('listitem');
      expect(checks.length).toBe(5);
    }
  });
});
