import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { randomObjectFactory } from '@lib/test-utils/factories';

import FactValue from './FactValue';

describe('FactValue component', () => {
  const scalarScenarios = [
    {
      type: 'string',
      plain: 'a string',
      stringRepresentation: 'a string',
    },
    {
      type: 'number - integer',
      plain: 42,
      stringRepresentation: '42',
    },
    {
      type: 'number - float',
      plain: 42.5,
      stringRepresentation: '42.5',
    },
    {
      type: 'boolean',
      plain: true,
      stringRepresentation: 'true',
    },
  ];

  it.each(scalarScenarios)(
    'should render just a scalar value of type "$type"',
    ({ plain, stringRepresentation }) => {
      render(<FactValue data={plain} />);

      expect(screen.getByText(stringRepresentation)).toBeVisible();
    }
  );

  it('should render just an object tree', () => {
    const data = randomObjectFactory.build();

    render(<FactValue data={data} />);

    expect(screen.getAllByLabelText('property tree')).toHaveLength(1);
  });
});
