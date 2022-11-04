import React, { useState, useEffect } from 'react';
import Table from '@components/Table';
import HealthIcon from '@components/Health/HealthIcon';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import HealthSummary from '@components/HealthSummary';
import useQueryStringValues from '@hooks/useQueryStringValues';
import { getCounters, isMostRelevantPrio } from './summarySelection';

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
      render: (content, item) => {
        const linkToDatabase = `/databases/${item.databaseId}`;
        return (
          <Link to={linkToDatabase}>
            <HealthIcon health={content} centered={true} />
          </Link>
        );
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
      render: (content, item) => {
        const linkToHosts = `/hosts?sid=${item.sid}`;
        return (
          <Link to={linkToHosts}>
            <HealthIcon health={content} centered={true} />
          </Link>
        );
      },
    },
  ],
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
        let result = false;

        healthFilters.forEach((f) => {
          result = result || isMostRelevantPrio(e, f);
        });
        return result;
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
    <div data-testid="home-health-summary">
      <h1 className="text-2xl font-semibold">At a glance</h1>
      <hr className="my-3" />
      <h5 className="text-xl">Global Health</h5>

      <HealthSummary
        {...counters}
        onFilterChange={onFiltersChange}
        activeFilters={activeFilters}
      />
      <Table config={healthSummaryTableConfig} data={summaryData} />
    </div>
  );
};
