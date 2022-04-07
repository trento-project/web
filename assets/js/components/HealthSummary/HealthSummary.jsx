import React, { Fragment } from 'react';
import { GlobalHealth } from './GlobalHealth';
import Table from '@components/Table';
import HealthIcon from '../Health/HealthIcon';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const any = (predicate, label) =>
  Object.keys(predicate).reduce((accumulator, key) => {
    if (accumulator) {
      return true;
    }
    return predicate[key] === label;
  }, false);

const getCounters = (data) => {
  const defaultCounter = { critical: 0, warning: 0, passing: 0, unknown: 0 };

  if (0 === data.length) {
    return defaultCounter;
  }

  return data.reduce((accumulator, element) => {
    if (any(element, 'critical')) {
      return { ...accumulator, critical: accumulator.critical + 1 };
    }

    if (any(element, 'warning')) {
      return { ...accumulator, warning: accumulator.warning + 1 };
    }

    if (any(element, 'unknown')) {
      return { ...accumulator, unknown: accumulator.unknown + 1 };
    }

    if (any(element, 'passing')) {
      return { ...accumulator, passing: accumulator.passing + 1 };
    }
    return accumulator;
  }, defaultCounter);
};

const healthSummaryTableConfig = {
  usePadding: false,
  columns: [
    {
      title: 'SID',
      key: 'sid',
      render: (content, item) => (
        <Link
          className="text-jungle-green-500 hover:opacity-75"
          to={`/sap-systems/${item.id}`}
        >
          {content}
        </Link>
      ),
    },
    {
      title: 'SAP Instances',
      key: 'sapsystemHealth',
      className: 'text-center',
      render: (content) => <HealthIcon health={content} centered={true} />,
    },
    {
      title: 'Database',
      key: 'databasehealth',
      className: 'text-center',
      render: (content) => {
        return <HealthIcon health={content} centered={true} />;
      },
    },
    {
      title: 'Pacemaker Clusters',
      key: 'clustersHealth',
      className: 'text-center',
      render: (content) => {
        return <HealthIcon health={content} centered={true} />;
      },
    },
    {
      title: 'Hosts',
      key: 'hostsHealth',
      className: 'text-center',
      render: (content) => {
        return <HealthIcon health={content} centered={true} />;
      },
    },
  ],
};

const HealthSummary = () => {
  const { loading, sapSystemsHealth } = useSelector(
    (state) => state.sapSystemsHealthSummary
  );

  const counters = getCounters(sapSystemsHealth);

  return loading ? (
    <div>Loading...</div>
  ) : (
    <Fragment>
      <GlobalHealth counters={counters} />
      <Table config={healthSummaryTableConfig} data={sapSystemsHealth} />
    </Fragment>
  );
};

export default HealthSummary;
