import React from 'react';
import classNames from 'classnames';
import Table from '@common/Table';

const upgradablePackagesDefault = [];

function UpgradablePackagesList({
  hostname,
  upgradablePackages = upgradablePackagesDefault,
}) {
  const config = {
    pagination: true,
    usePadding: false,
    columns: [
      {
        title: 'Installed Packages',
        key: 'installedPackage',
        render: (content, _) => <div className="font-bold">{content}</div>,
      },
      {
        title: 'Latest Package',
        key: 'latestPackage',
        render: (content, _) => <div>{content}</div>,
      },
      {
        title: 'Related Patches',
        key: 'patches',
        render: (content, { to_package_id }) => (
          <div>
            {content.map(({ advisory_name }) => (
              <div key={`${to_package_id}-${advisory_name}`}>
                {advisory_name}
              </div>
            ))}
          </div>
        ),
      },
    ],
  };

  const data = upgradablePackages.map((up) => {
    const { name, from_version, from_release, to_version, to_release, arch } =
      up;

    return {
      ...up,
      installedPackage: `${name}-${from_version}-${from_release}.${arch}`,
      latestPackage: `${name}-${to_version}-${to_release}.${arch}`,
    };
  });

  return (
    <>
      <h1 className="text-3xl w-4/5 p-4">
        <span className="font-medium">Upgradable Packages: </span>
        <span
          className={classNames(
            'font-bold truncate w-60 inline-block align-top'
          )}
        >
          {hostname}
        </span>
      </h1>
      <div className="bg-white rounded-lg shadow">
        <Table config={config} data={data} />
      </div>
    </>
  );
}

export default UpgradablePackagesList;
