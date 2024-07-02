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
    errata.fixes = {};

    render(
      <AdvisoryDetails advisoryName={faker.lorem.word()} errata={errata} />
    );

    expect(screen.getAllByText('No data available').length).toBe(3);
  });

  it('displays relevant errata data', () => {
    const errata = advisoryErrataFactory.build();
    const advisoryName = faker.lorem.word();

    render(<AdvisoryDetails advisoryName={advisoryName} errata={errata} />);

    expect(screen.getByText(advisoryName)).toBeVisible();
    expect(screen.getByText(errata.errata_details.synopsis)).toBeVisible();
    expect(
      screen.getByText(errata.errata_details.advisory_status)
    ).toBeVisible();
    expect(screen.getByText(errata.errata_details.description)).toBeVisible();
  });

  it('displays CVEs, packages', () => {
    const errata = advisoryErrataFactory.build();
    const advisoryName = faker.lorem.word();

    const packages = faker.word.words(2).split(' ');
    const cves = faker.word.words(2).split(' ');

    errata.cves = cves;

    render(
      <AdvisoryDetails
        advisoryName={advisoryName}
        errata={errata}
        packages={packages}
      />
    );

    cves.forEach((expectedWord) => {
      expect(screen.getByText(expectedWord)).toBeVisible();
    });

    packages.forEach((expectedWord) => {
      expect(screen.getByText(expectedWord)).toBeVisible();
    });
  });

  it('displays fixes with according link', () => {
    const errata = advisoryErrataFactory.build();
    const advisoryName = faker.lorem.word();

    render(<AdvisoryDetails advisoryName={advisoryName} errata={errata} />);

    Object.entries(errata.fixes).forEach(([id, fixText]) => {
      const el = screen.getByText(fixText);
      el.href.includes(id);
      expect(el).toBeVisible();
    });
  });
});
