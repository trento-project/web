import React from 'react';
import { useSelector } from 'react-redux';

import day from 'dayjs'

const Home = () => {
  const liveFeed = useSelector((state) => state.liveFeed.entries);
  const hosts = useSelector((state) => state.hostsList.hosts);
  const hostsNumber = hosts.length;

  return (
    <div className="container px-4">
      <div className="">
        <div className="max-w-xs py-4 px-8 bg-white shadow rounded-lg my-2">
          <div>
            <h2 className="text-gray-600">Hosts</h2>
            <p className="mt-2 text-gray-800 text-3xl font-semibold">
              {hostsNumber}
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col mt-16">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Time
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Source
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Message
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {liveFeed.map(({ time, source, message }) => (
                    <tr key={time} className="animate-fade">
                      <td className="px-6 py-4 whitespace-nowrap text-xs">
                    <div className="content-center">{day(time).format('YYYY-MM-DD HH:mm:ss')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{source}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
