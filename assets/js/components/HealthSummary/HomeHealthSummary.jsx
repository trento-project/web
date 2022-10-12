import React from 'react';
import Table from '@components/Table';
import HealthIcon from '../Health/HealthIcon';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import HealthSummary from '@components/HealthSummary';
import { useState } from 'react';
import { useEffect } from 'react';
import useQueryStringValues from '@hooks/useQueryStringValues';

const healthSummaryTableConfig = {
  usePadding: false,
  columns: [
    {
      title: 'SID',
      key: 'sid',
      render: (content, item) => (
        <Link
          className="text-jungle-green-500 hover:opacity-75"
          to={`/sap_systems/${item.id}`}
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
      key: 'databaseHealth',
      className: 'text-center',
      render: (content) => {
        return <HealthIcon health={content} centered={true} />;
      },
    },
    {
      title: 'Pacemaker Clusters',
      key: 'clustersHealth',
      className: 'text-center',
      render: (content, item) => {
        const linkToCluster = `/clusters/${item.clusterId}`;
        return (
          <Link to={linkToCluster}>
            <HealthIcon health={content} centered={true} />
          </Link>
        );
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

const any = (predicate, label) =>
  Object.keys(predicate).reduce((accumulator, key) => {
    if (accumulator) {
      return true;
    }
    return predicate[key] === label;
  }, false);

const getCounters = (data) => {
  const defaultCounter = { critical: 0, warning: 0, passing: 0, unknown: 0 };

  if (!data || 0 === data.length) {
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

export const HomeHealthSummary = () => {
  const { loading, sapSystemsHealth } = useSelector(
    (state) => state.sapSystemsHealthSummary
  );

  const {
    extractedParams: { health: healthFilters = [] },
    setQueryValues,
  } = useQueryStringValues(['health']);

  const [counters, setCounters] = useState({
    warning: 0,
    critical: 0,
    passing: 0,
  });

  const [summaryData, setSummaryData] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});

  useEffect(() => {
    setCounters(getCounters(sapSystemsHealth));
    setSummaryData(sapSystemsHealth);
  }, [sapSystemsHealth]);

  useEffect(() => {
    setActiveFilters(
      healthFilters.reduce((acc, curr) => ({ ...acc, [curr]: true }), {})
    );
    if (healthFilters.length === 0) {
      setSummaryData(sapSystemsHealth);
      return;
    }
    setSummaryData(
      sapSystemsHealth.filter((e) => {
        return healthFilters.every((f) => any(e, f));
      })
    );
  }, [healthFilters]);

  const onFiltersChange = (filterValue) => {
    const newFilters = healthFilters.includes(filterValue)
      ? healthFilters.filter((f) => f !== filterValue)
      : [...healthFilters, filterValue];

    setQueryValues({ health: newFilters });
  };

  return loading ? (
    <div>Loading...</div>
  ) : (
    <>
      <h1 className="text-2xl font-semibold">At a glance</h1>
      <hr className="my-3" />
      <h5 className="text-xl font-semibold">Global Health</h5>
      <HealthSummary
        {...counters}
        onFilterChange={onFiltersChange}
        activeFilters={activeFilters}
      />
      <Table config={healthSummaryTableConfig} data={summaryData} />
    </>
  );
};
