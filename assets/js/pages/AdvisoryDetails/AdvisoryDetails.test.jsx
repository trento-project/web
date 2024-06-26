import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { faker } from '@faker-js/faker';

import { renderWithRouter as render } from '@lib/test-utils';
import { advisoryErrataFactory } from '@lib/test-utils/factories';

import AdvisoryDetails from './AdvisoryDetails';

describe('AdvisoryDetails', () => {
  it('displays a message, when the CVE, packages or fixes section is empty', () => {
    const errata = advisoryErrataFactory.build();

    render(
      <AdvisoryDetails advisoryName={faker.lorem.word()} errata={errata} />
    );

    expect(screen.getAllByText('No data available').length).toBe(3);
  });

  it('displays relevant errata data', () => {
    const errata = advisoryErrataFactory.build();
    const advisoryName = faker.lorem.word()

    render(
      <AdvisoryDetails advisoryName={advisoryName} errata={errata} />
    );

    expect(screen.getByText(advisoryName)).toBeVisible()
    expect(screen.getByText(errata.synopsis)).toBeVisible()
    expect(screen.getByText(errata.advisory_status)).toBeVisible()
    expect(screen.getByText(errata.description)).toBeVisible()
  });
});
