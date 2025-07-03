import React from 'react';

import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { faker } from '@faker-js/faker';

import AttributesDetails from './AttributesDetails';

describe('AttributesDetails', () => {
  it('should show empty attributes table', async () => {
    const attributes = [];
    const pageTitle = faker.person.firstName();

    render(<AttributesDetails attributes={attributes} title={pageTitle} />);

    const detailsButton = screen.getByText('Details');
    await userEvent.click(detailsButton);

    expect(screen.getByText(pageTitle)).toBeInTheDocument();
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('should show attributes', async () => {
    const attributes = { key1: 'value1', key2: 'value2' };
    const pageTitle = faker.person.firstName();

    render(<AttributesDetails attributes={attributes} title={pageTitle} />);

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
});
