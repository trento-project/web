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
    errata.cves = [];

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

  it('packages', () => {
    const errata = advisoryErrataFactory.build();
    const advisoryName = faker.lorem.word();

    const packages = faker.word.words(2).split(' ');

    render(
      <AdvisoryDetails
        advisoryName={advisoryName}
        errata={errata}
        packages={packages}
      />
    );

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

  it('displays CVEs with according link', () => {
    const errata = advisoryErrataFactory.build();
    const advisoryName = faker.lorem.word();

    render(<AdvisoryDetails advisoryName={advisoryName} errata={errata} />);

    errata.cves.forEach((cve) => {
      const el = screen.getByText(cve);
      el.href.includes(cve);
      expect(el).toBeVisible();
    });
  });

  it('displays a single fix with according link', () => {
    const errata = advisoryErrataFactory.build();
    errata.fixes = Object.fromEntries([Object.entries(errata.fixes)[0]]);
    const advisoryName = faker.lorem.word();

    render(<AdvisoryDetails advisoryName={advisoryName} errata={errata} />);

    Object.entries(errata.fixes).forEach(([id, fixText]) => {
      const el = screen.getByText(fixText);
      el.href.includes(id);
      expect(el).toBeVisible();
    });
  });

  it('displays a single CVE with according link', () => {
    const errata = advisoryErrataFactory.build();
    errata.cves = [errata.cves[0]];
    const advisoryName = faker.lorem.word();

    render(<AdvisoryDetails advisoryName={advisoryName} errata={errata} />);

    errata.cves.forEach((cve) => {
      const el = screen.getByText(cve);
      el.href.includes(cve);
      expect(el).toBeVisible();
    });
  });
});
