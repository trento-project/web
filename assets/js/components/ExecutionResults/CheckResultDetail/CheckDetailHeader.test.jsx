import React from 'react';
import { screen } from '@testing-library/react';

import { faker } from '@faker-js/faker';
import { renderWithRouter } from '@lib/test-utils';

import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
import CheckDetailHeader from './CheckDetailHeader';

describe('CheckDetailHeader Component', () => {
  it('should render a header with expected information', () => {
    const clusterID = faker.datatype.uuid();
    const checkID = faker.datatype.uuid();
    const checkDescription = faker.lorem.sentence();
    const targetType = 'host';
    const targetName = faker.animal.bear();
    const cloudProvider = 'azure';

    renderWithRouter(
      <CheckDetailHeader
        clusterID={clusterID}
        checkID={checkID}
        checkDescription={checkDescription}
        targetType={targetType}
        targetName={targetName}
        cloudProvider={cloudProvider}
        result="passing"
      />
    );

    const healthIcon = screen.getAllByTestId('eos-svg-component')[1];

    expect(healthIcon).toHaveClass('fill-jungle-green-500');
    expect(screen.getByText('Back to Check Results')).toBeTruthy();
    expect(screen.getByText('Azure')).toBeTruthy();
    expect(screen.getByText('Host')).toBeTruthy();
    expect(screen.getByText(targetName)).toBeTruthy();
    expect(screen.getByText(checkDescription)).toBeTruthy();
  });

  it('should render a header with a warning banner on an unknown provider detection', () => {
    const clusterID = faker.datatype.uuid();
    const checkID = faker.datatype.uuid();
    const checkDescription = faker.lorem.sentence();
    const targetType = 'cluster';
    const targetName = faker.animal.bear();
    const cloudProvider = 'unknown';

    renderWithRouter(
      <CheckDetailHeader
        clusterID={clusterID}
        checkID={checkID}
        checkDescription={checkDescription}
        targetType={targetType}
        targetName={targetName}
        cloudProvider={cloudProvider}
      />
    );

    expect(screen.getByText('Back to Check Results')).toBeTruthy();
    expect(screen.getByText('Provider not recognized')).toBeTruthy();
    expect(screen.getByText('Cluster')).toBeTruthy();
    expect(
      screen.getByText(/valid for on-premise bare metal platforms./)
    ).toBeTruthy();
    expect(screen.getByText(checkDescription)).toBeTruthy();
  });

  it('should navigate back to Check Results', async () => {
    const user = userEvent.setup();
    const clusterID = faker.datatype.uuid();
    const checkID = faker.datatype.uuid();
    const checkDescription = faker.lorem.sentence();
    const targetType = 'host';
    const targetName = faker.animal.bear();
    const cloudProvider = 'azure';

    renderWithRouter(
      <CheckDetailHeader
        clusterID={clusterID}
        checkID={checkID}
        checkDescription={checkDescription}
        targetType={targetType}
        targetName={targetName}
        cloudProvider={cloudProvider}
      />
    );

    const backButton = screen.getByText('Back to Check Results');

    expect(backButton).toBeTruthy();
    expect(screen.getByText('Azure')).toBeTruthy();
    expect(screen.getByText('Host')).toBeTruthy();
    expect(screen.getByText(targetName)).toBeTruthy();
    expect(screen.getByText(checkDescription)).toBeTruthy();

    await act(async () => user.click(backButton));

    expect(window.location.pathname).toEqual(
      `/clusters/${clusterID}/executions/last`
    );
  });
});
