import React, { Fragment } from 'react';
import Table from '@components/Table';
import HealthIcon from '../Health/HealthIcon';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import HealthSummary from '@components/HealthSummary';

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
      render: (content) => {
        return <HealthIcon health={content} centered={true} />;
      },
    },
  ],
};

const GlobalHealth = ({ data }) => {
  return (
    <Fragment>
      <h1 className="text-2xl font-semibold">At a glance</h1>
      <hr className="my-3" />
      <h5 className="text-xl">Global Health</h5>
      <HealthSummary data={data} />
    </Fragment>
  );
};

export const HomeHealthSummary = () => {
  const { loading, sapSystemsHealth } = useSelector(
    (state) => state.sapSystemsHealthSummary
  );

  return loading ? (
    <div>Loading...</div>
  ) : (
    <Fragment>
      <GlobalHealth data={sapSystemsHealth} />
      <Table config={healthSummaryTableConfig} data={sapSystemsHealth} />
    </Fragment>
  );
};
