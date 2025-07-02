import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';

import Table from '@common/Table';
import HealthIcon from '@common/HealthIcon';
import PageHeader from '@common/PageHeader';

import useQueryStringValues from '@hooks/useQueryStringValues';
import HealthSummary from '@pages/HealthSummary';

import { getCounters, isMostRelevantPrio } from './summarySelection';

const healthSummaryTableConfig = {
  usePadding: false,
  columns: [
    {
      title: 'SID',
      key: 'sid',
      className: 'w-1/6',
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
      title: 'Application instances',
      key: 'sapsystemHealth',
      className: 'text-center w-1/6',
      render: (content, item) => (
        <Link to={`/sap_systems/${item.id}`}>
          <HealthIcon health={content} centered isLink />
        </Link>
      ),
    },
    {
      title: 'Application cluster',
      key: 'applicationClusterHealth',
      className: 'text-center w-1/6',
      render: (content, item) => {
        const linkToCluster = `/clusters/${item.applicationClusterId}`;

        return item?.applicationClusterId ? (
          <Link to={linkToCluster}>
            <HealthIcon health={content} centered isLink />
          </Link>
        ) : (
          <HealthIcon health={content} centered hoverOpacity={false} />
        );
      },
    },
    {
      title: 'Database',
      key: 'databaseHealth',
      className: 'text-center w-1/6',
      render: (content, item) => {
        const linkToDatabase = `/databases/${item.databaseId}`;
        return (
          <Link to={linkToDatabase}>
            <HealthIcon health={content} centered isLink />
          </Link>
        );
      },
    },
    {
      title: 'Database cluster',
      key: 'databaseClusterHealth',
      className: 'text-center w-1/6',
      render: (content, item) => {
        const linkToCluster = `/clusters/${item.databaseClusterId}`;

        return item?.databaseClusterId ? (
          <Link to={linkToCluster}>
            <HealthIcon health={content} centered isLink />
          </Link>
        ) : (
          <HealthIcon health={content} centered hoverOpacity={false} />
        );
      },
    },
    {
      title: 'Hosts',
      key: 'hostsHealth',
      className: 'text-center w-1/6',
      render: (content, item) => {
        const linkToHosts = `/hosts?sid=${item.sid}&sid=${item.databaseSid}`;
        return (
          <Link to={linkToHosts}>
            <HealthIcon health={content} centered isLink />
          </Link>
        );
      },
    },
  ],
};

function HomeHealthSummary({ sapSystemsHealth, loading }) {
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

  const normalizedSummaryData = summaryData.map((summaryDataEntry) => ({
    applicationClusterHealth: summaryDataEntry.application_cluster_health,
    applicationClusterId: summaryDataEntry.application_cluster_id,
    databaseClusterHealth: summaryDataEntry.database_cluster_health,
    databaseClusterId: summaryDataEntry.database_cluster_id,
    databaseHealth: summaryDataEntry.database_health,
    databaseId: summaryDataEntry.database_id,
    hostsHealth: summaryDataEntry.hosts_health,
    id: summaryDataEntry.id,
    sapsystemHealth: summaryDataEntry.sapsystem_health,
    sid: summaryDataEntry.sid,
    databaseSid: summaryDataEntry.database_sid,
  }));

  return loading ? (
    <div>Loading...</div>
  ) : (
    <div data-testid="home-health-summary">
      <PageHeader className="font-bold">At a glance</PageHeader>
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-2">
          <h5 className="text-xl">Global Health</h5>

          <HealthSummary
            {...counters}
            onFilterChange={onFiltersChange}
            activeFilters={activeFilters}
          />
        </div>

        <Table
          config={healthSummaryTableConfig}
          data={normalizedSummaryData}
          roundedTop={false}
        />
      </div>
    </div>
  );
}

export default HomeHealthSummary;
