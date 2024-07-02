import React from 'react';
import 'intersection-observer';
import { faker } from '@faker-js/faker';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { APPLICATION_TYPE, DATABASE_TYPE } from '@lib/model/sapSystems';
import { renderWithRouter } from '@lib/test-utils';

import userEvent from '@testing-library/user-event';

import {
  hostFactory,
  sapSystemApplicationInstanceFactory,
  sapSystemFactory,
} from '@lib/test-utils/factories';

import { GenericSystemDetails } from './GenericSystemDetails';

describe('GenericSystemDetails', () => {
  it('should render correctly', () => {
    const title = faker.string.uuid();
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

  it('should render a not found label if system is not there', () => {
    const title = faker.string.uuid();
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
        title={faker.string.uuid()}
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
        title={faker.string.uuid()}
        system={sapSystem}
        userAbilities={[{ name: 'all', resource: 'all' }]}
        cleanUpPermittedFor={['cleanup:application_instance']}
        type={APPLICATION_TYPE}
      />
    );

    expect(screen.queryByRole('button', { name: 'Clean up' })).toBeVisible();
    const [_sapSystemIcon, health, _cleanUpIcon] =
      screen.getAllByTestId('eos-svg-component');
    expect(health).toHaveClass('fill-black');
  });

  it.each([
    {
      type: APPLICATION_TYPE,
      text: 'In the case of an ASCS instance',
    },
    {
      type: DATABASE_TYPE,
      text: 'In the case of the last database instance',
    },
  ])('should clean up an instance on request', async ({ type, text }) => {
    const user = userEvent.setup();
    const mockedCleanUp = jest.fn();

    const sapSystem = sapSystemFactory.build({
      instances: sapSystemApplicationInstanceFactory.buildList(2),
    });

    sapSystem.instances[0].absent_at = faker.date.past().toISOString();
    sapSystem.hosts = hostFactory.buildList(5);

    renderWithRouter(
      <GenericSystemDetails
        title={faker.string.uuid()}
        system={sapSystem}
        type={type}
        userAbilities={[{ name: 'all', resource: 'all' }]}
        cleanUpPermittedFor={['cleanup:application_instance']}
        onInstanceCleanUp={mockedCleanUp}
      />
    );

    const cleanUpButton = screen.queryByRole('button', {
      name: 'Clean up',
    });
    await user.click(cleanUpButton);
    expect(
      screen.getByText(text, {
        exact: false,
      })
    ).toBeInTheDocument();

    const cleanUpModalButton = screen.getAllByRole('button', {
      name: 'Clean up',
    })[0];
    await user.click(cleanUpModalButton);
    expect(mockedCleanUp).toHaveBeenCalledWith(sapSystem.instances[0]);
  });

  it('should forbid instance cleanup', async () => {
    const user = userEvent.setup();
    const mockedCleanUp = jest.fn();

    const sapSystem = sapSystemFactory.build({
      instances: sapSystemApplicationInstanceFactory.buildList(2),
    });

    sapSystem.instances[0].absent_at = faker.date.past().toISOString();
    sapSystem.hosts = hostFactory.buildList(5);

    renderWithRouter(
      <GenericSystemDetails
        title={faker.string.uuid()}
        system={sapSystem}
        type={APPLICATION_TYPE}
        userAbilities={[]}
        cleanUpPermittedFor={['cleanup:application_instance']}
        onInstanceCleanUp={mockedCleanUp}
      />
    );

    const cleanUpButton = screen.getByText('Clean up').closest('button');

    expect(cleanUpButton).toBeDisabled();

    await user.click(cleanUpButton);

    await user.hover(cleanUpButton);

    expect(
      screen.queryByText('You are not authorized for this action')
    ).toBeVisible();
  });
});
