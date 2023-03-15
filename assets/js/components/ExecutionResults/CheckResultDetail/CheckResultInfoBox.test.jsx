import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { faker } from '@faker-js/faker';
import { TARGET_CLUSTER, TARGET_HOST } from '@lib/model';
import CheckResultInfoBox from './CheckResultInfoBox';

describe('CheckResultInfoBox Component', () => {
  [
    {
      checkID: faker.datatype.uuid(),
      targetType: TARGET_CLUSTER,
      expectedTargetTypeText: 'Cluster',
      targetName: faker.lorem.word(),
      provider: 'aws',
      expectedProviderText: 'AWS',
    },
    {
      checkID: faker.datatype.uuid(),
      targetType: TARGET_HOST,
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
  ].forEach(
    ({
      checkID,
      targetType,
      expectedTargetTypeText,
      targetName,
      provider,
      expectedProviderText,
    }) => {
      it(`should display a proper check result info box for check "${checkID}" on target of type "${targetType}" named "${targetName}"`, () => {
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
      });
    }
  );
});
