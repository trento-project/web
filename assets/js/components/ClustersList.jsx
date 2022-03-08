import React, { Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import Table from './Table';

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

  const config = {
    columns: [
      {
        title: 'Health',
        key: 'health',
        render: (content) => (
          <div className="ml-4">{getHealthIcon(content)}</div>
        ),
      },
      {
        title: 'Name',
        key: 'name',
        render: (content, item) => {
          return (
            <Link
              className="text-jungle-green-500 hover:opacity-75"
              to={`/clusters/${item.id}/checks`}
            >
              {content}
            </Link>
          );
        },
      },
      {
        title: 'ID',
        key: 'id',
        render: (content) => (
          <p className="text-gray-900 whitespace-no-wrap truncate">{content}</p>
        ),
      },
      {
        title: 'SID',
        key: 'sid',
      },
      {
        title: 'Type',
        key: 'type',
        render: (content, item) => (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 truncate">
            {getClusterTypeLabel(item.type)}
          </span>
        ),
      },
      {
        title: 'Check results',
        key: 'check_results',
        render: (content, item) => (
          <Menu as="div" className="relative inline-block text-left">
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
                        onClick={() => navigate(`/clusters/${item.id}/checks`)}
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
                              clusterID: item.id,
                            },
                          });
                          navigate(`/clusters/${item.id}/checks/results`);
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
        ),
      },
    ],
  };

  const data = clusters.map((cluster) => {
    return {
      health: cluster.health,
      name: cluster.name,
      id: cluster.id,
      sid: cluster.sid,
      type: cluster.type,
    };
  });

  return <Table config={config} data={data} />;
};

export default ClustersList;
