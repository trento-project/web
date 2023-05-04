import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { faker } from '@faker-js/faker';
import CheckResultInfoBox from './CheckResultInfoBox';

describe('CheckResultInfoBox Component', () => {
  const scenarios = [
    {
      checkID: faker.datatype.uuid(),
      targetType: 'cluster',
      expectedTargetTypeText: 'Cluster',
      targetName: faker.lorem.word(),
      provider: 'aws',
      expectedProviderText: 'AWS',
    },
    {
      checkID: faker.datatype.uuid(),
      targetType: 'host',
      expectedTargetTypeText: 'Host',
      targetName: faker.lorem.word(),
      provider: 'azure',
      expectedProviderText: 'Azure',
    },
    {
      checkID: faker.datatype.uuid(),
      targetType: 'foobar',
      expectedTargetTypeText: 'Unknown target type',
      targetName: faker.lorem.word(),
      provider: 'azure',
      expectedProviderText: 'Azure',
    },
  ];

  it.each(scenarios)(
    'should display a proper check result info box for check "$checkID" on target of type "$targetType" named "$targetName"',
    ({
      checkID,
      targetType,
      expectedTargetTypeText,
      targetName,
      provider,
      expectedProviderText,
    }) => {
      const { getByText } = render(
        <CheckResultInfoBox
          checkID={checkID}
          targetType={targetType}
          targetName={targetName}
          provider={provider}
        />
      );
      expect(getByText(checkID)).toBeTruthy();
      expect(getByText(expectedProviderText)).toBeTruthy();
      expect(getByText(expectedTargetTypeText)).toBeTruthy();
      expect(getByText(targetName)).toBeTruthy();
    }
  );
});
