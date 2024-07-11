import React from 'react';
import { format } from 'date-fns';

import PageHeader from '@common/PageHeader';
import ListView from '@common/ListView';
import AdvisoryIcon from '@common/AdvisoryIcon';

const formatPackage = ({ name, version, epoch, release, arch_label }) =>
  `${name}-${version}-${epoch}.${release}-${arch_label}`;

function EmptyData() {
  return <p>No data available</p>;
}

function AdvisoryDetails({
  advisoryName,
  errata,
  affectsPackageMaintenanceStack,
}) {
  const {
    issue_date: issueDate,
    update_date: updateDate,
    synopsis,
    advisory_status: status,
    type,
    description,
    reboot_suggested: rebootSuggested,
  } = errata.errata_details;

  const {
    fixes,
    cves,
    affected_packages: affectedPackages,
    affected_systems: affectedSystems,
  } = errata;

  return (
    <div>
      <PageHeader className="flex h-auto items-center">
        <h1 className="mr-2">
          Advisory Details: <span className="font-bold">{advisoryName}</span>
        </h1>{' '}
        <AdvisoryIcon type={type} />
      </PageHeader>
      <div className="flex flex-col mb-4">
        <h2 className="text-xl font-bold mb-2">Synopsis</h2>
        <div className="bg-white py-4 px-6 shadow shadow-md rounded-lg">
          <p className="mb-6">{synopsis}</p>
          <ListView
            orientation="horizontal"
            titleClassName="text-sm"
            data={[
              {
                title: 'Issued',
                content: format(issueDate, 'd MMM y'),
              },
              {
                title: 'Status',
                content: status,
              },
              {
                title: 'Updated',
                content: format(updateDate, 'd MMM y'),
              },
              {
                title: 'Reboot Required',
                content: rebootSuggested ? 'Yes' : 'No',
              },
              {
                title: 'Affects Package Maintenance Stack',
                content: affectsPackageMaintenanceStack ? 'Yes' : 'No',
              },
            ]}
          />
        </div>
      </div>
      <div className="flex flex-col mb-4">
        <h2 className="text-xl font-bold mb-2">Description</h2>
        <div className="bg-white py-4 px-6 shadow shadow-md rounded-lg">
          <p>{description}</p>
        </div>
      </div>
      <div className="flex flex-col mb-4">
        <h2 className="text-xl font-bold mb-2">Fixes</h2>
        <div className="bg-white py-4 px-6 shadow shadow-md rounded-lg">
          {fixes && Object.keys(fixes).length ? (
            <ul>
              {Object.entries(fixes).map(([id, fix]) => (
                <li key={`bug-${id}`}>
                  <a
                    className="text-jungle-green-500 hover:opacity-75"
                    href={`https://bugzilla.suse.com/show_bug.cgi?id=${id}`}
                  >
                    {fix}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyData />
          )}
        </div>
      </div>
      <div className="flex flex-col mb-4">
        <h2 className="text-xl font-bold mb-2">CVEs</h2>
        <div className="bg-white py-4 px-6 shadow shadow-md rounded-lg">
          {cves && cves.length ? (
            <ul>
              {cves.map((cve) => (
                <li key={cve}>
                  <a
                    className="text-jungle-green-500 hover:opacity-75"
                    href={`https://cve.mitre.org/cgi-bin/cvename.cgi?name=${cve}`}
                  >
                    {cve}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyData />
          )}
        </div>
      </div>
      <div className="flex flex-col mb-4">
        <h2 className="text-xl font-bold mb-2">Affected Packages</h2>
        <div className="bg-white py-4 px-6 shadow shadow-md rounded-lg">
          {affectedPackages && affectedPackages.length ? (
            <ul>
              {affectedPackages.map((pkg) => (
                <li key={formatPackage(pkg)}>{formatPackage(pkg)}</li>
              ))}
            </ul>
          ) : (
            <EmptyData />
          )}
        </div>
      </div>
      <div className="flex flex-col mb-4">
        <h2 className="text-xl font-bold mb-2">Affected Systems</h2>
        <div className="bg-white py-4 px-6 shadow shadow-md rounded-lg">
          {affectedSystems && affectedSystems.length ? (
            <ul>
              {affectedSystems.map(({ name }) => (
                <li key={`system-${name}`}>{name}</li>
              ))}
            </ul>
          ) : (
            <EmptyData />
          )}
        </div>
      </div>
    </div>
  );
}

export default AdvisoryDetails;
