import React from 'react';
import {
  EOS_SHIELD_OUTLINED,
  EOS_CRITICAL_BUG_OUTLINED,
  EOS_ADD_BOX_OUTLINED,
} from 'eos-icons-react';
import classNames from 'classnames';

import PageHeader from '@common/PageHeader';
import ListView from '@common/ListView';
import Tooltip from '@common/Tooltip';
import { computedIconCssClass } from '@lib/icon';

import { format } from 'date-fns';

const iconFromAdvisoryType = (
  advisoryType,
  centered = false,
  hoverOpacity = true,
  size = 'l'
) => {
  const hoverOpacityClassName = {
    'hover:opacity-75': hoverOpacity,
    'hover:opacity-100': !hoverOpacity,
  };

  switch (advisoryType) {
    case 'security_advisory':
      return (
        <Tooltip content={advisoryType}>
          <EOS_SHIELD_OUTLINED
            className={classNames(
              hoverOpacityClassName,
              computedIconCssClass('fill-red-500', centered),
              'inline-block'
            )}
            size={size}
          />
        </Tooltip>
      );
    case 'bugfix':
      return (
        <Tooltip content={advisoryType}>
          <EOS_CRITICAL_BUG_OUTLINED
            className={classNames(
              hoverOpacityClassName,
              computedIconCssClass('fill-yellow-500', centered),
              'inline-block'
            )}
            size={size}
          />
        </Tooltip>
      );
    case 'enhancement':
      return (
        <Tooltip content={advisoryType}>
          <EOS_ADD_BOX_OUTLINED
            className={classNames(
              hoverOpacityClassName,
              computedIconCssClass('fill-yellow-500', centered),
              'inline-block'
            )}
            size={size}
          />
        </Tooltip>
      );
    default:
      return null;
  }
};

function EmptyData() {
  return <p>No data dvailable</p>;
}

function AdvisoryDetails({
  name,
  status,
  type,
  synopsis,
  description,
  issueDate,
  updateDate,
  rebootRequired,
  affectsPackageMaintanaceStack,
  fixes,
  cves,
  packages,
}) {
  return (
    <div>
      <PageHeader className="flex h-auto items-center">
        <h1 className="mr-2">
          Advisory Details: <span className="font-bold">{name}</span>
        </h1>{' '}
        {iconFromAdvisoryType(type, false, true, 'xxl')}
      </PageHeader>
      <div className="flex flex-col mb-4">
        <h2 className="text-xl font-bold mb-2">Synopsis</h2>
        <div className="bg-white py-4 px-6 shadow shadow-md rounded-lg">
          <p className="mb-2">{synopsis}</p>
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
                content: rebootRequired ? 'Yes' : 'No',
              },
              {
                title: 'Affects Package Maintanace Stack',
                content: affectsPackageMaintanaceStack ? 'Yes' : 'No',
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
          <ul>
            {fixes && fixes.length > 1 ? (
              fixes.map((fix) => <li>{fix}</li>)
            ) : (
              <EmptyData />
            )}
          </ul>
        </div>
      </div>
      <div className="flex flex-col mb-4">
        <h2 className="text-xl font-bold mb-2">CVEs</h2>
        <div className="bg-white py-4 px-6 shadow shadow-md rounded-lg">
          <ul>
            {cves && cves.length > 1 ? (
              cves.map((cve) => <li>{cve}</li>)
            ) : (
              <EmptyData />
            )}
          </ul>
        </div>
      </div>
      <div className="flex flex-col mb-4">
        <h2 className="text-xl font-bold mb-2">Affected Packages</h2>
        <div className="bg-white py-4 px-6 shadow shadow-md rounded-lg">
          <ul>
            {packages && packages.length > 1 ? (
              packages.map((pkg) => <li>{pkg}</li>)
            ) : (
              <EmptyData />
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AdvisoryDetails;
