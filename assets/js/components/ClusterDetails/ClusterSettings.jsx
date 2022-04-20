import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';

import { EOS_ARROW_BACK } from 'eos-icons-react';
import Button from '@components/Button';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

import { Tab } from '@headlessui/react';
import { ChecksSelection } from './ChecksSelection';

export const ClusterSettings = () => {
  const { clusterID } = useParams();
  const navigate = useNavigate();

  const clusters = useSelector((state) => state.clustersList.clusters);
  const cluster = clusters.find((cluster) => cluster.id === clusterID);

  let [categories] = useState({
    "Checks Selection": (<ChecksSelection />),
    "Connection Settings": (
      <div className="flex relative ">
        <span className="rounded-l-md inline-flex  items-center px-3 border-t bg-white border-l border-b  border-gray-300 text-gray-500 shadow-sm text-sm">
          <svg width="15" height="15" fill="currentColor" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
            <path d="M1792 710v794q0 66-47 113t-113 47h-1472q-66 0-113-47t-47-113v-794q44 49 101 87 362 246 497 345 57 42 92.5 65.5t94.5 48 110 24.5h2q51 0 110-24.5t94.5-48 92.5-65.5q170-123 498-345 57-39 100-87zm0-294q0 79-49 151t-122 123q-376 261-468 325-10 7-42.5 30.5t-54 38-52 32.5-57.5 27-50 9h-2q-23 0-50-9t-57.5-27-52-32.5-54-38-42.5-30.5q-91-64-262-182.5t-205-142.5q-62-42-117-115.5t-55-136.5q0-78 41.5-130t118.5-52h1472q65 0 112.5 47t47.5 113z">
            </path>
          </svg>
        </span>
        <input type="text" id="email-with-icon" className=" rounded-r-lg flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent" name="email" placeholder="Your email" />
      </div>
    )
  });

  return (
    <div className="w-full px-2 py-16 sm:px-0">
      <div>
        <h1 className="w-full text-3xl">
          <span className="font-medium">Cluster Settings for</span>{' '}
          <span className="font-bold">{cluster && cluster.name}</span>
        </h1>
        <Button
          className="w-1/5 my-3"
          type="secondary"
          size="small"
          onClick={() => navigate(`/clusters/${cluster.id}`)}
        >
          <EOS_ARROW_BACK className="inline-block" /> Back to Cluster
        </Button>
      </div>
      <Tab.Group>
        <Tab.List className="flex p-1 space-x-1 bg-green-900/20 rounded-xl">
          {Object.keys(categories).map((category) => (
            <Tab
              key={category}
              className={({ selected }) =>
                classNames(
                  'w-full py-2.5 text-sm leading-5 font-medium text-green-700 rounded-lg',
                  'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-green-400 ring-white ring-opacity-60',
                  selected
                    ? 'bg-white shadow'
                    : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                )
              }
            >
              {category}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-2">
          {Object.values(categories).map((posts, idx) => (
            <Tab.Panel
              key={idx}
              className={classNames(
                'bg-white rounded-xl p-3',
                'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white ring-opacity-60'
              )}
            >
              <ul>
                {posts}
              </ul>
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}

