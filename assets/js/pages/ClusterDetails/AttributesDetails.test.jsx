import React from 'react';

import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { faker } from '@faker-js/faker';
import { capitalize } from 'lodash';

import { clusterResourceFactory } from '@lib/test-utils/factories';

import AttributesDetails from './AttributesDetails';

describe('AttributesDetails', () => {
  it('should show empty attributes table', async () => {
    const resources = clusterResourceFactory.buildList(1);
    const attributes = [];
    const pageTitle = faker.person.firstName();

    render(
      <AttributesDetails
        attributes={attributes}
        resources={resources}
        title={pageTitle}
      />
    );

    const detailsButton = screen.getByText('Details');
    await userEvent.click(detailsButton);

    expect(screen.getByText(pageTitle)).toBeInTheDocument();
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('should show empty resources table', async () => {
    const resources = [];
    const attributes = { key1: 'value1', key2: 'value2' };
    const pageTitle = faker.person.firstName();

    render(
      <AttributesDetails
        attributes={attributes}
        resources={resources}
        title={pageTitle}
      />
    );

    const detailsButton = screen.getByText('Details');
    await userEvent.click(detailsButton);

    expect(screen.getByText(pageTitle)).toBeInTheDocument();

    expect(screen.getByText('No data available')).toBeInTheDocument();
    expect(screen.queryByText('fail count')).not.toBeInTheDocument();
  });

  it('should show attributes', async () => {
    const resources = [];
    const attributes = { key1: 'value1', key2: 'value2' };
    const pageTitle = faker.person.firstName();

    render(
      <AttributesDetails
        attributes={attributes}
        resources={resources}
        title={pageTitle}
      />
    );

    const detailsButton = screen.getByText('Details');
    await userEvent.click(detailsButton);

    expect(screen.getByText(pageTitle)).toBeInTheDocument();
    const attributesTable = screen.getAllByRole('table')[0];
    expect(
      attributesTable.querySelectorAll('tbody > tr > td').item(0)
    ).toHaveTextContent('key1');
    expect(
      attributesTable.querySelectorAll('tbody > tr > td').item(1)
    ).toHaveTextContent('value1');
  });

  it('should show resources', async () => {
    const resources = clusterResourceFactory.buildList(1);
    const { id, role, status, type, managed, fail_count } = resources[0];
    const attributes = {};
    const pageTitle = faker.person.firstName();

    render(
      <AttributesDetails
        attributes={attributes}
        resources={resources}
        title={pageTitle}
      />
    );

    const detailsButton = screen.getByText('Details');
    await userEvent.click(detailsButton);

    expect(screen.getByText(pageTitle)).toBeInTheDocument();
    const resourceTable = screen.getAllByRole('table')[1];
    expect(
      resourceTable.querySelectorAll('tbody > tr > td').item(0)
    ).toHaveTextContent(fail_count);
    expect(
      resourceTable.querySelectorAll('tbody > tr > td').item(1)
    ).toHaveTextContent(id);
    expect(
      resourceTable.querySelectorAll('tbody > tr > td').item(2)
    ).toHaveTextContent(role);
    expect(
      resourceTable.querySelectorAll('tbody > tr > td').item(3)
    ).toHaveTextContent(status);
    expect(
      resourceTable.querySelectorAll('tbody > tr > td').item(4)
    ).toHaveTextContent(capitalize(`${managed}`));
    expect(
      resourceTable.querySelectorAll('tbody > tr > td').item(5)
    ).toHaveTextContent(type);
  });
});
