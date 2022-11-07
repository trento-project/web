import React from 'react';

import { screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { faker } from '@faker-js/faker';
import { renderWithRouter } from '@lib/test-utils';
import { catalogCheckFactory } from '@lib/test-utils/factories';

import CatalogContainer from './CatalogContainer';

describe('ChecksCatalog CatalogContainer component', () => {
  it('should render the notification box', () => {
    renderWithRouter(<CatalogContainer catalogError />);

    expect(screen.getByRole('button')).toHaveTextContent('Try again');
  });

  it('should render the loading box', () => {
    renderWithRouter(<CatalogContainer loading={true} />);

    expect(screen.getByText('Loading checks catalog...')).toBeVisible();
  });

  it('should render the checks catalog', () => {
    const groupName1 = faker.animal.cat();
    const groupName2 = faker.animal.cat();
    const group1 = catalogCheckFactory.buildList(5, { group: groupName1 });
    const group2 = catalogCheckFactory.buildList(5, { group: groupName2 });
    const catalog = { items: group1.concat(group2) };

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

  it('should show check remediation when the row is clicked', () => {
    const groupName = faker.animal.cat();
    const catalogChecks = catalogCheckFactory.buildList(2, {
      group: groupName,
    });
    const checkRemediation1 = catalogChecks[0].remediation;
    const checkRemediation2 = catalogChecks[1].remediation;
    const catalog = { items: catalogChecks };

    renderWithRouter(
      <CatalogContainer
        loading={false}
        catalogError={null}
        catalogData={catalog}
      />
    );

    const groups = screen.getAllByRole('list');
    const { getAllByRole } = within(groups[0]);
    let checks = getAllByRole('listitem');
    const check1 = checks[0].querySelector('div');
    const check2 = checks[1].querySelector('div');

    expect(screen.queryByText(checkRemediation1)).not.toBeInTheDocument();
    userEvent.click(check1);
    expect(screen.getByText(checkRemediation1)).toBeVisible();
    userEvent.click(check1);
    expect(screen.queryByText(checkRemediation1)).not.toBeInTheDocument();

    expect(screen.queryByText(checkRemediation2)).not.toBeInTheDocument();
    userEvent.click(check2);
    expect(screen.getByText(checkRemediation2)).toBeVisible();
  });
});
