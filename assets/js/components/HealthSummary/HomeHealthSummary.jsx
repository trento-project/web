import React, { useState, useEffect } from 'react';
import Table from '@components/Table';
import HealthIcon from '@components/Health/HealthIcon';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PageHeader from '@components/PageHeader';
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
      render: (content, item) => (
        <Link to={`/sap_systems/${item.id}`}>
          <HealthIcon health={content} centered />
        </Link>
      ),
    },
    {
      title: 'Database',
      key: 'databaseHealth',
      className: 'text-center',
      render: (content, item) => {
        const linkToDatabase = `/databases/${item.databaseId}`;
        return (
          <Link to={linkToDatabase}>
            <HealthIcon health={content} centered />
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

        return item?.clusterId ? (
          <Link to={linkToCluster}>
            <HealthIcon health={content} centered />
          </Link>
        ) : (
          <HealthIcon health={content} centered hoverOpacity={false} />
        );
      },
    },
    {
      title: 'Hosts',
      key: 'hostsHealth',
      className: 'text-center',
      render: (content, item) => {
        const linkToHosts = `/hosts?sid=${item.sid}&sid=${item.tenant}`;
        return (
          <Link to={linkToHosts}>
            <HealthIcon health={content} centered />
          </Link>
        );
      },
    },
  ],
};

export function HomeHealthSummary() {
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
      <PageHeader>At a glance</PageHeader>
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
}
