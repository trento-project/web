import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { faker } from '@faker-js/faker';
import CheckResultInfoBox from './CheckResultInfoBox';

describe('CheckResultInfoBox Component', () => {
  const scenarios = [
    {
      checkID: faker.string.uuid(),
      resultTargetType: 'cluster',
      expectedTargetTypeText: 'Cluster',
      resultTargetName: faker.lorem.word(),
      provider: 'aws',
      expectedProviderText: 'AWS',
    },
    {
      checkID: faker.string.uuid(),
      resultTargetType: 'host',
      expectedTargetTypeText: 'Host',
      resultTargetName: faker.lorem.word(),
      provider: 'azure',
      expectedProviderText: 'Azure',
    },
    {
      checkID: faker.string.uuid(),
      resultTargetType: 'foobar',
      expectedTargetTypeText: 'Unknown target type',
      resultTargetName: faker.lorem.word(),
      provider: 'azure',
      expectedProviderText: 'Azure',
    },
  ];

  it.each(scenarios)(
    'should display a proper check result info box for check "$checkID" on target of type "$targetType" named "$targetName"',
    ({
      checkID,
      resultTargetType,
      expectedTargetTypeText,
      resultTargetName,
      provider,
      expectedProviderText,
    }) => {
      const { getByText } = render(
        <CheckResultInfoBox
          checkID={checkID}
          resultTargetType={resultTargetType}
          resultTargetName={resultTargetName}
          provider={provider}
        />
      );
      expect(getByText(checkID)).toBeTruthy();
      expect(getByText(expectedProviderText)).toBeTruthy();
      expect(getByText(expectedTargetTypeText)).toBeTruthy();
      expect(getByText(resultTargetName)).toBeTruthy();
    }
  );
});
