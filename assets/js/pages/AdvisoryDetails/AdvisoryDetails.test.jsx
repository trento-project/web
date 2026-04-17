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
      affected_systems: [],
    });

    render(
      <AdvisoryDetails advisoryName={faker.lorem.word()} errata={errata} />
    );

    expect(screen.getAllByText('No data available').length).toBe(4);
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

  it('renders issued and updated dates using the provided timezone', () => {
    const timezone = 'Pacific/Kiritimati';
    const errata = advisoryErrataFactory.build({
      errata_details: {
        issue_date: '2024-01-10T23:30:00.000Z',
        update_date: '2024-01-11T23:30:00.000Z',
      },
    });

    render(
      <AdvisoryDetails
        advisoryName={faker.lorem.word()}
        errata={errata}
        timezone={timezone}
      />
    );

    expect(screen.getByText('Issued').nextSibling).toHaveTextContent(
      '11 Jan 2024'
    );
    expect(screen.getByText('Updated').nextSibling).toHaveTextContent(
      '12 Jan 2024'
    );
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

  it('displays affected systems', () => {
    const errata = advisoryErrataFactory.build();
    const advisoryName = faker.lorem.word();

    render(<AdvisoryDetails advisoryName={advisoryName} errata={errata} />);

    errata.affected_systems.forEach(({ name }) => {
      const el = screen.getByText(name);
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
