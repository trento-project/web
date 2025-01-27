import React, { act } from 'react';
import { screen } from '@testing-library/react';

import { faker } from '@faker-js/faker';
import { renderWithRouter } from '@lib/test-utils';

import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { cloudProviderEnum, resultEnum } from '@lib/test-utils/factories';
import CheckDetailHeader from './CheckDetailHeader';

describe('CheckDetailHeader Component', () => {
  const targetIdentifier = faker.string.uuid();
  const scenarios = [
    {
      checkID: faker.string.uuid(),
      checkDescription: faker.lorem.sentence(),
      targetID: targetIdentifier,
      targetType: 'cluster',
      resultTargetType: 'host',
      resultTargetName: faker.animal.bear(),
      cloudProvider: 'azure',
      result: resultEnum(),
      expectedProviderText: 'Azure',
      expectedResultTargetTypeText: 'Host',
    },
    {
      checkID: faker.string.uuid(),
      checkDescription: faker.lorem.sentence(),
      targetID: targetIdentifier,
      targetType: 'cluster',
      resultTargetType: 'cluster',
      resultTargetName: faker.animal.bear(),
      cloudProvider: 'aws',
      result: resultEnum(),
      expectedProviderText: 'AWS',
      expectedResultTargetTypeText: 'Cluster',
    },
    {
      checkID: faker.string.uuid(),
      checkDescription: faker.lorem.sentence(),
      targetID: targetIdentifier,
      targetType: 'host',
      resultTargetType: 'host',
      resultTargetName: faker.animal.bear(),
      cloudProvider: 'gcp',
      result: resultEnum(),
      expectedProviderText: 'GCP',
      expectedResultTargetTypeText: 'Host',
    },
  ];

  it.each(scenarios)(
    'should render a header with expected information',
    async ({
      checkID,
      checkDescription,
      targetID,
      targetType,
      resultTargetType,
      resultTargetName,
      cloudProvider,
      result,
      expectedProviderText,
      expectedResultTargetTypeText,
    }) => {
      renderWithRouter(
        <CheckDetailHeader
          checkID={checkID}
          checkDescription={checkDescription}
          targetID={targetID}
          targetType={targetType}
          resultTargetType={resultTargetType}
          resultTargetName={resultTargetName}
          cloudProvider={cloudProvider}
          result={result}
        />
      );

      expect(screen.getAllByTestId('eos-svg-component')).toHaveLength(2);
      expect(screen.getByText('Back to Check Results')).toBeTruthy();
      expect(screen.getByText(expectedProviderText)).toBeTruthy();
      expect(screen.getByText(expectedResultTargetTypeText)).toBeTruthy();
      expect(screen.getByText(resultTargetName)).toBeTruthy();
      expect(screen.getByText(checkDescription)).toBeTruthy();
    }
  );

  it('should render a header with a warning banner on an unknown provider detection, when the target is a cluster', () => {
    const targetID = faker.string.uuid();
    const checkID = faker.string.uuid();
    const checkDescription = faker.lorem.sentence();
    const targetType = 'cluster';
    const resultTargetType = 'host';
    const resultTargetName = faker.animal.bear();
    const cloudProvider = 'unknown';

    renderWithRouter(
      <CheckDetailHeader
        checkID={checkID}
        checkDescription={checkDescription}
        targetID={targetID}
        targetType={targetType}
        resultTargetType={resultTargetType}
        resultTargetName={resultTargetName}
        cloudProvider={cloudProvider}
        result="critical"
      />
    );

    expect(screen.getByText('Back to Check Results')).toBeTruthy();
    expect(screen.getByText('Provider not recognized')).toBeTruthy();
    expect(screen.getByText('Host')).toBeTruthy();
    expect(
      screen.getByText(/valid for on-premise bare metal platforms./)
    ).toBeTruthy();
    expect(screen.getByText(checkDescription)).toBeTruthy();
  });

  const navigationScenarios = [
    {
      targetID: targetIdentifier,
      targetType: 'cluster',
      resultTargetType: 'host',
      expectedExecutionURL: `/clusters/${targetIdentifier}/executions/last`,
    },
    {
      targetID: targetIdentifier,
      targetType: 'cluster',
      resultTargetType: 'cluster',
      expectedExecutionURL: `/clusters/${targetIdentifier}/executions/last`,
    },
    {
      targetID: targetIdentifier,
      targetType: 'host',
      resultTargetType: 'host',
      expectedExecutionURL: `/hosts/${targetIdentifier}/executions/last`,
    },
  ];

  it.each(navigationScenarios)(
    'should navigate back to target Checks Results',
    async ({
      targetID,
      targetType,
      resultTargetType,
      expectedExecutionURL,
    }) => {
      const user = userEvent.setup();
      renderWithRouter(
        <CheckDetailHeader
          checkID={faker.string.uuid()}
          checkDescription={faker.lorem.sentence()}
          targetID={targetID}
          targetType={targetType}
          resultTargetType={resultTargetType}
          resultTargetName={faker.animal.bear()}
          cloudProvider={cloudProviderEnum()}
          result={resultEnum()}
        />
      );

      const backButton = screen.getByText('Back to Check Results');

      expect(backButton).toBeTruthy();

      await act(async () => user.click(backButton));

      expect(window.location.pathname).toEqual(expectedExecutionURL);
    }
  );
});
