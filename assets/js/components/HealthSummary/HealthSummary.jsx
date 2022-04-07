import React, { useState, useEffect, Fragment } from 'react';
import { GlobalHealth } from './GlobalHealth';
import Table from '@components/Table';
import HealthIcon from '../Health/HealthIcon';
import { get } from 'axios';
import { Link } from 'react-router-dom';

const any = (predicate, label) =>
  Object.keys(predicate).reduce((accumulator, key) => {
    if (accumulator) {
      return true;
    }
    return predicate[key] === label;
  }, false);

const getCounters = (data) =>
  data.reduce(
    (accumulator, element) => {
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
    },
    { critical: 0, warning: 0, passing: 0, unknown: 0 }
  );

const healthOverviewTableConfig = {
  usePadding: false,
  columns: [
    {
      title: 'SID',
      key: 'sid',
      render: (content, item) => <Link
        className="text-jungle-green-500 hover:opacity-75"
        to={`/sap-systems/${item.id}`}
      >
        {content}
      </Link>
    },
    {
      title: 'SAP Instances',
      key: 'sapsystem_health',
      className: "text-center",
      render: (content) => <HealthIcon health={content} centered={true} />,
    },
    {
      title: 'Database',
      key: 'database_health',
      className: "text-center",
      render: (content) => {
        return <HealthIcon health={content} centered={true} />;
      },
    },
    {
      title: 'Pacemaker Clusters',
      key: 'clusters_health',
      className: "text-center",
      render: (content) => {
        return <HealthIcon health={content} centered={true} />;
      },
    },
    {
      title: 'Hosts',
      key: 'hosts_health',
      className: "text-center",
      render: (content) => {
        return <HealthIcon health={content} centered={true} />;
      },
    }
  ],
};

const HealthSummary = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const counters = getCounters(data);

  useEffect(() => {
    setLoading(true);
    get('/api/sap_systems/health')
      .then(({ data }) => {
        setLoading(false);
        data ? setData(data) : setData([]);
      })
      .catch((error) => {
        setLoading(false);
        logError(error);
        setData([]);
      });
  }, []);

  return loading ? (
    <div>Loading...</div>
  ) : (
    <Fragment>
      <GlobalHealth counters={counters} />
      <Table config={healthOverviewTableConfig} data={data} />
    </Fragment>
  );
};

export default HealthSummary;