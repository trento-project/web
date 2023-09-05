import React from 'react';
import { faker } from '@faker-js/faker';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { APPLICATION_TYPE } from '@lib/model';
import { renderWithRouter } from '@lib/test-utils';
import {
  hostFactory,
  sapSystemApplicationInstanceFactory,
  sapSystemFactory,
} from '@lib/test-utils/factories';

import { GenericSystemDetails } from './GenericSystemDetails';

describe('GenericSystemDetails', () => {
  it('should render correctly', () => {
    const title = faker.datatype.uuid();
    const sapSystem = sapSystemFactory.build({
      ensa_version: 'ensa1',
      instances: sapSystemApplicationInstanceFactory.buildList(5),
    });

    sapSystem.hosts = hostFactory.buildList(5);

    const { sid, application_instances: applicationInstances } = sapSystem;
    const { features } = applicationInstances[0];

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
    expect(screen.getByText('ENSA1')).toBeTruthy();
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

  it('should not render ENSA version if it is not available', () => {
    const sapSystem = sapSystemFactory.build({
      ensa_version: 'no_ensa',
      instances: sapSystemApplicationInstanceFactory.buildList(5),
    });

    sapSystem.hosts = hostFactory.buildList(5);

    renderWithRouter(
      <GenericSystemDetails
        title={faker.datatype.uuid()}
        system={sapSystem}
        type={APPLICATION_TYPE}
      />
    );

    expect(screen.getByText('ENSA version').nextSibling).toHaveTextContent('-');
  });

  it('should render a cleanup button and correct health icon when absent instances exist', () => {
    const sapSystem = sapSystemFactory.build({
      instances: sapSystemApplicationInstanceFactory.buildList(5),
    });

    sapSystem.instances[0].absent_at = faker.date.past().toISOString();
    sapSystem.hosts = hostFactory.buildList(5);

    renderWithRouter(
      <GenericSystemDetails
        title={faker.datatype.uuid()}
        system={sapSystem}
        type={APPLICATION_TYPE}
      />
    );

    expect(screen.queryByRole('button', { name: 'Clean up' })).toBeVisible();
    const [_sapSystemIcon, health, _cleanUpIcon] =
      screen.getAllByTestId('eos-svg-component');
    expect(health).toHaveClass('fill-black');
  });
});
