import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';

import { Switch } from '@headlessui/react';

import NotificationBox from '../NotificationBox';
import LoadingBox from '../LoadingBox';

import { EOS_ERROR } from 'eos-icons-react';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const toggle = (list, element) =>
  list.includes(element)
    ? list.filter((string) => string !== element)
    : [...list, element];

export const ChecksSelection = () => {
  const { clusterID } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const clusters = useSelector((state) => state.clustersList.clusters);
  const cluster = clusters.find((cluster) => cluster.id === clusterID);

  const [selectedChecks, setSelectedChecks] = useState(
    cluster ? cluster.selected_checks : []
  );

  const isSelected = (check_id) =>
    selectedChecks ? selectedChecks.includes(check_id) : false;

  const [catalogData, catalogError, loading] = useSelector((state) => [
    state.catalog.data,
    state.catalog.error,
    state.catalog.loading,
  ]);

  const dispatchUpdateCatalog = () => {
    dispatch({
      type: 'UPDATE_CATALOG',
      payload: { provider: 'azure' }, //FIXME: Get provider properly
    });
  };

  useEffect(() => {
    if (cluster) {
      setSelectedChecks(cluster.selected_checks ? cluster.selected_checks : []);
    }
  }, [cluster]);

  useEffect(() => {
    dispatchUpdateCatalog();
  }, [dispatch]);

  if (loading) {
    return <LoadingBox text="Loading checks catalog..." />;
  }

  if (catalogError) {
    return (
      <NotificationBox
        icon={<EOS_ERROR className="m-auto" color="red" size="xl" />}
        text={catalogError}
        buttonText="Try again"
        buttonOnClick={dispatchUpdateCatalog}
      />
    );
  }

  return (
    <div>
      {catalogData[0]?.groups &&
        catalogData[0].groups.map(({ group, checks }, idx) => (
          <div
            key={idx}
            className="bg-white shadow overflow-hidden sm:rounded-md mb-8"
          >
            <div className="bg-white px-4 py-5 border-b border-gray-200 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {group}
              </h3>
            </div>
            <ul role="list" className="divide-y divide-gray-200">
              {checks.map((check) => (
                <li key={check.id}>
                  <a href="#" className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">{check.name}</p>
                        <p className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {check.id}
                        </p>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {check.description}
                          </p>
                        </div>
                        <Switch.Group as="div" className="flex items-center">
                          <Switch
                            checked={isSelected(check.id)}
                            className={classNames(
                              isSelected(check.id)
                                ? 'bg-jungle-green-500'
                                : 'bg-gray-200',
                              'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer focus:outline-none transition-colors ease-in-out duration-200'
                            )}
                            onChange={() => {
                              setSelectedChecks(
                                toggle(selectedChecks, check.id)
                              );
                            }}
                          >
                            <span
                              aria-hidden="true"
                              className={classNames(
                                isSelected(check.id)
                                  ? 'translate-x-5'
                                  : 'translate-x-0',
                                'inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                              )}
                            />
                          </Switch>
                        </Switch.Group>
                      </div>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      <div className="place-items-end">
        <button
          className="bg-jungle-green-500 hover:opacity-75 text-white font-bold py-2 px-4 rounded"
          onClick={() => {
            dispatch({
              type: 'CHECKS_SELECTED',
              payload: { checks: selectedChecks, clusterID: clusterID },
            });
            navigate(`/clusters/${clusterID}/checks/results`);
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
};
