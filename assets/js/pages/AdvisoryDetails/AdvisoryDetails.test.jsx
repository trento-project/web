import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { faker } from '@faker-js/faker';

import { renderWithRouter as render } from '@lib/test-utils';
import { advisoryErrataFactory, cveFactory } from '@lib/test-utils/factories';

import AdvisoryDetails from './AdvisoryDetails';

describe('AdvisoryDetails', () => {
  it('displays a message, when the CVE, packages or fixes section is empty', () => {
    const errata = advisoryErrataFactory.build({
      cves: [],
      fixes: {},
      affected_packages: [],
    });

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

  it('displays affected packages', () => {
    const errata = advisoryErrataFactory.build();
    const advisoryName = faker.lorem.word();

    render(<AdvisoryDetails advisoryName={advisoryName} errata={errata} />);

    errata.affected_packages.forEach(({ name }) => {
      const el = screen.getByText(name, { exact: false });
      expect(el).toBeVisible();
    });
  });

  it('displays fixes with a valid link', () => {
    const errata = advisoryErrataFactory.build();
    const advisoryName = faker.lorem.word();

    render(<AdvisoryDetails advisoryName={advisoryName} errata={errata} />);

    Object.entries(errata.fixes).forEach(([id, fixText]) => {
      const el = screen.getByText(fixText);
      expect(el.href.includes(id)).toBe(true);
      expect(el).toBeVisible();
    });
  });

  it('displays CVEs with a valid link', () => {
    const errata = advisoryErrataFactory.build({
      cves: cveFactory.buildList(faker.number.int({ min: 2, max: 10 })),
    });

    const advisoryName = faker.lorem.word();

    render(<AdvisoryDetails advisoryName={advisoryName} errata={errata} />);

    errata.cves.forEach((cve) => {
      const el = screen.getByText(cve);
      expect(el.href.includes(cve)).toBe(true);
      expect(el).toBeVisible();
    });
  });

  it('displays a single fix with a valid link', () => {
    const errata = advisoryErrataFactory.build();
    const advisoryName = faker.lorem.word();

    render(<AdvisoryDetails advisoryName={advisoryName} errata={errata} />);

    Object.entries(errata.fixes).forEach(([id, fixText]) => {
      const el = screen.getByText(fixText);
      expect(el.href.includes(id)).toBe(true);
      expect(el).toBeVisible();
    });
  });

  it('displays a single CVE with a valid link', () => {
    const errata = advisoryErrataFactory.build();
    const advisoryName = faker.lorem.word();

    render(<AdvisoryDetails advisoryName={advisoryName} errata={errata} />);

    errata.cves.forEach((cve) => {
      const el = screen.getByText(cve);
      expect(el.href.includes(cve)).toBe(true);
      expect(el).toBeVisible();
    });
  });
});
