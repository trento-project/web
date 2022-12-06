import React from 'react';
import { useSelector } from 'react-redux';

import day from 'dayjs';

import Table from '@components/Table';

const liveFeedConfig = {
  columns: [
    {
      title: 'Time',
      key: 'time',
      render: (time) => (
        <div className="content-center">
          {day(time).format('YYYY-MM-DD HH:mm:ss')}
        </div>
      ),
    },
    { title: 'Source', key: 'source' },
    { title: 'Message', key: 'message' },
  ],
};

function LiveFeed() {
  const liveFeed = useSelector((state) => state.liveFeed.entries);
  const hosts = useSelector((state) => state.hostsList.hosts);
  const clusters = useSelector((state) => state.clustersList.clusters);
  const hostsNumber = hosts.length;
  const clustersNumber = clusters.length;

  return (
    <div className="container px-4">
      <div className="flex flex-row">
        <div className="min-w-[30%] py-4 px-8 bg-white shadow rounded-lg my-2 mr-4">
          <div>
            <h2 className="text-gray-600">Hosts</h2>
            <p className="mt-2 text-gray-800 text-3xl font-semibold">
              {hostsNumber}
            </p>
          </div>
        </div>
        <div className="min-w-[30%] py-4 px-8 bg-white shadow rounded-lg my-2">
          <div>
            <h2 className="text-gray-600">Clusters</h2>
            <p className="mt-2 text-gray-800 text-3xl font-semibold">
              {clustersNumber}
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col mt-16">
        <Table config={liveFeedConfig} data={liveFeed} />
      </div>
    </div>
  );
}

export default LiveFeed;
