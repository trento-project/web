import React, { Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';

import {
  EOS_EDIT,
  EOS_RUN_CIRCLE,
  EOS_LUNCH_DINING,
  EOS_LENS_FILLED,
} from 'eos-icons-react';

import Spinner from './Spinner';

const getClusterTypeLabel = (type) => {
  switch (type) {
    case 'hana_scale_up':
      return 'HANA Scale Up';
    case 'hana_scale_out':
      return 'HANA Scale Out';
    default:
      return 'Unknown';
  }
};

const getHealthIcon = (health) => {
  switch (health) {
    case 'passing':
      return <EOS_LENS_FILLED className="fill-jungle-green-500" />;
    case 'warning':
      return <EOS_LENS_FILLED className="fill-yellow-500" />;
    case 'critical':
      return <EOS_LENS_FILLED className="fill-red-500" />;
    case 'pending':
      return <Spinner />;
    default:
      return <EOS_LENS_FILLED className="fill-gray-500" />;
  }
};

const ClustersList = () => {
  const clusters = useSelector((state) => state.clustersList.clusters);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col">
      <div className="-my-2 sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow border-b border-gray-200 rounded sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Health
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    SID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className=" px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <span className="sr-only">Checks results</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clusters.map((cluster) => (
                  <tr key={cluster.id} className="animate-fade">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="ml-4">
                        {getHealthIcon(cluster.health)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a
                        href={`/clusters/${cluster.id}/checks/results`}
                        className="text-jungle-green-500 hover:opacity-75"
                      >
                        {cluster.name}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {cluster.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {cluster.sid}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {getClusterTypeLabel(cluster.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Menu
                        as="div"
                        className="relative inline-block text-left"
                      >
                        <div>
                          <Menu.Button className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-green-100 rounded-md hover:bg-green-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                            <EOS_LUNCH_DINING />
                          </Menu.Button>
                        </div>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="absolute z-10 right-0 w-56 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="px-1 py-1 ">
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    className={`${
                                      active
                                        ? 'bg-jungle-green-500 text-white'
                                        : 'text-gray-900'
                                    } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                    onClick={() =>
                                      navigate(`/clusters/${cluster.id}/checks`)
                                    }
                                  >
                                    <span className="pr-1">
                                      {active ? (
                                        <EOS_EDIT color="white" />
                                      ) : (
                                        <EOS_EDIT color="black" />
                                      )}
                                    </span>
                                    Edit checks
                                  </button>
                                )}
                              </Menu.Item>
                            </div>
                            <div className="px-1 py-1">
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    className={`${
                                      active
                                        ? 'bg-jungle-green-500 text-white'
                                        : 'text-gray-900'
                                    } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                    onClick={() => {
                                      dispatch({
                                        type: 'REQUEST_CHECKS_EXECUTION',
                                        payload: {
                                          clusterID: cluster.id,
                                        },
                                      });
                                      navigate(
                                        `/clusters/${cluster.id}/checks/results`
                                      );
                                    }}
                                  >
                                    <span className="pr-1">
                                      {active ? (
                                        <EOS_RUN_CIRCLE color="white" />
                                      ) : (
                                        <EOS_RUN_CIRCLE color="black" />
                                      )}
                                    </span>
                                    Start execution
                                  </button>
                                )}
                              </Menu.Item>
                            </div>
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClustersList;
