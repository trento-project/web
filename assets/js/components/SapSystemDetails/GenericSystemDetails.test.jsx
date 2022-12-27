import React from 'react';
import { faker } from '@faker-js/faker';
import { screen } from '@testing-library/react';

import { APPLICATION_TYPE } from '@lib/model';
import { renderWithRouter } from '@lib/test-utils';
import { sapSystemFactory } from '@lib/test-utils/factories';

import { GenericSystemDetails } from './GenericSystemDetails';

describe('GenericSystemDetails', () => {
  it('should render correctly', () => {
    const title = faker.datatype.uuid();
    const sapSystem = sapSystemFactory.build();

    const { sid, instances } = sapSystem;
    const { features } = instances[0];

    renderWithRouter(
      <GenericSystemDetails
        title={title}
        system={sapSystem}
        type={APPLICATION_TYPE}
      />
    );

    expect(screen.getByText(title)).toBeTruthy();
    expect(screen.getByText('Application server')).toBeTruthy();
    expect(screen.getByText(sid)).toBeTruthy();
    features.split('|').forEach((role) => {
      expect(screen.queryAllByText(role)).toBeTruthy();
    });
  });

  it('renders a not found label if system is not there', () => {
    const title = faker.datatype.uuid();
    renderWithRouter(
      <GenericSystemDetails title={title} type={APPLICATION_TYPE} />
    );

    expect(screen.getByText('Not Found')).toBeTruthy();
  });
});
