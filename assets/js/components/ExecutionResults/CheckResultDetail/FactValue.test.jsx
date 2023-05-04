import React from 'react';
import { render, screen } from '@testing-library/react';
import { faker } from '@faker-js/faker';
import '@testing-library/jest-dom';

import { randomObjectFactory } from '@lib/test-utils/factories';

import FactValue from './FactValue';

describe('FactValue component', () => {
  it('should render just a scalar value', () => {
    const plainString = faker.hacker.noun();

    render(<FactValue data={plainString} />);

    expect(screen.getByText(plainString)).toBeVisible();
  });

  it('should render just an object tree', () => {
    const data = randomObjectFactory.build();

    render(<FactValue data={data} />);

    expect(screen.getAllByLabelText('property tree')).toHaveLength(1);
  });
});
