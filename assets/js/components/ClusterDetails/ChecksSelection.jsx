/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Disclosure, Switch, Transition } from '@headlessui/react';

import {
  EOS_ERROR,
  EOS_KEYBOARD_ARROW_RIGHT,
  EOS_LOADING_ANIMATED,
} from 'eos-icons-react';
import classNames from 'classnames';
import { remove, uniq } from '@lib/lists';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  SavingFailedAlert,
  SuggestTriggeringChecksExecutionAfterSettingsUpdated,
} from './ClusterSettings';
import LoadingBox from '../LoadingBox';
import NotificationBox from '../NotificationBox';

const toggle = (list, element) => (list.includes(element)
  ? list.filter((string) => string !== element)
  : [...list, element]);

export function ChecksSelection({ clusterId, cluster }) {
  const dispatch = useDispatch();

  const [selectedChecks, setSelectedChecks] = useState(
    cluster ? cluster.selected_checks : [],
  );

  const isSelected = (check_id) => (selectedChecks ? selectedChecks.includes(check_id) : false);

  const [[catalogData], catalogError, loading] = useSelector((state) => [
    state.catalog.data,
    state.catalog.error,
    state.catalog.loading,
  ]);

  const { saving, savingError, savingSuccess } = useSelector(
    (state) => state.clusterChecksSelection,
  );

  const [localSavingError, setLocalSavingError] = useState(null);
  const [localSavingSuccess, setLocalSavingSuccess] = useState(null);
  const [groupSelection, setGroupSelection] = useState([]);

  const dispatchUpdateCatalog = () => {
    dispatch({
      type: 'UPDATE_CATALOG',
      payload: { provider: cluster?.provider },
    });
  };

  useEffect(() => {
    if (cluster) {
      setSelectedChecks(cluster.selected_checks ? cluster.selected_checks : []);
    }
  }, [cluster?.selected_checks]);

  useEffect(() => {
    cluster?.provider && dispatchUpdateCatalog();
  }, [cluster?.provider]);

  useEffect(() => {
    const groups = catalogData?.groups;
    const groupedCheckSelection = groups?.map(({ group, checks }) => {
      const groupChecks = checks.map((check) => ({
        ...check,
        selected: isSelected(check.id),
      }));
      const allSelected = checks.every((check) => isSelected(check.id));
      const someSelected = !allSelected && checks.some((check) => isSelected(check.id));
      return {
        group,
        checks: groupChecks,
        allSelected,
        someSelected,
        noneSelected: !allSelected && !someSelected,
      };
    });
    setGroupSelection(groupedCheckSelection);
  }, [catalogData?.groups, selectedChecks]);

  useEffect(() => {
    setLocalSavingError(savingError);
    setLocalSavingSuccess(savingSuccess);
  }, [savingError, savingSuccess]);

  useEffect(() => {
    if (loading === true) {
      setLocalSavingError(null);
      setLocalSavingSuccess(null);
    }
  }, [loading]);

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

  if (loading || !catalogData?.groups) {
    return <LoadingBox text="Loading checks catalog..." />;
  }

  return (
    <div>
      <div className="pb-4">
        {groupSelection?.map(
          ({
            group, checks, allSelected, someSelected, noneSelected,
          }) => (
            <div
              key={group}
              className="bg-white shadow overflow-hidden sm:rounded-md mb-1"
            >
              <Disclosure>
                {({ open }) => (
                  <>
                    <div className="flex hover:bg-gray-100 border-b border-gray-200">
                      <Switch.Group
                        as="div"
                        className="flex items-center hover:bg-white pl-2"
                      >
                        <Switch
                          checked={allSelected}
                          className={classNames(
                            {
                              'bg-jungle-green-500': allSelected,
                              'bg-green-300': someSelected,
                              'bg-gray-200': noneSelected,
                            },
                            'tn-check-switch relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer focus:outline-none transition-colors ease-in-out duration-200',
                          )}
                          onChange={() => {
                            const groupChecks = checks.map((check) => check.id);
                            if (noneSelected || someSelected) {
                              setSelectedChecks(
                                uniq([...selectedChecks, ...groupChecks]),
                              );
                            }
                            if (allSelected) {
                              setSelectedChecks(
                                remove(groupChecks, selectedChecks),
                              );
                            }
                            setLocalSavingSuccess(null);
                          }}
                        >
                          <span
                            aria-hidden="true"
                            className={classNames(
                              {
                                'translate-x-5': allSelected,
                                'translate-x-2.5': someSelected,
                                'translate-x-0': noneSelected,
                              },
                              'inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200',
                            )}
                          />
                        </Switch>
                      </Switch.Group>
                      <Disclosure.Button
                        as="div"
                        className="flex justify-between w-full cursor-pointer bg-white px-4 py-5 sm:px-6 hover:bg-gray-100"
                      >
                        <h3 className="tn-check-switch text-lg leading-6 font-medium text-gray-900">
                          {group}
                        </h3>

                        <EOS_KEYBOARD_ARROW_RIGHT
                          className={`${open ? 'transform rotate-90' : ''}`}
                        />
                      </Disclosure.Button>
                    </div>

                    {open && (
                    <div>
                      <Transition
                        enter="transition duration-100 ease-out"
                        enterFrom="transform opacity-0"
                        enterTo="transform opacity-100"
                        leave="transition duration-100 ease-out"
                        leaveFrom="transform opacity-100"
                        leaveTo="transform opacity-0"
                      >
                        <Disclosure.Panel className="border-none">
                          <ul
                            className="divide-y divide-gray-200"
                          >
                            {checks.map((check) => (
                              <li key={check.id}>
                                <a role="button" className="block hover:bg-gray-50">
                                  <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center">
                                      <p className="text-sm font-medium">
                                        {check.name}
                                      </p>
                                      <p className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        {check.id}
                                      </p>
                                    </div>
                                    <div className="mt-2 sm:flex sm:justify-between">
                                      <div className="sm:flex">
                                        <ReactMarkdown
                                          className="markdown"
                                          remarkPlugins={[remarkGfm]}
                                        >
                                          {check.description}
                                        </ReactMarkdown>
                                      </div>
                                      <Switch.Group
                                        as="div"
                                        className="flex items-center"
                                      >
                                        <Switch
                                          checked={check.selected}
                                          className={classNames(
                                            isSelected(check.id)
                                              ? 'bg-jungle-green-500'
                                              : 'bg-gray-200',
                                            'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer focus:outline-none transition-colors ease-in-out duration-200',
                                          )}
                                          onChange={() => {
                                            setSelectedChecks(
                                              toggle(selectedChecks, check.id),
                                            );
                                            setLocalSavingSuccess(null);
                                          }}
                                        >
                                          <span
                                            aria-hidden="true"
                                            className={classNames(
                                              isSelected(check.id)
                                                ? 'translate-x-5'
                                                : 'translate-x-0',
                                              'inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200',
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
                        </Disclosure.Panel>
                      </Transition>
                    </div>
                    )}
                  </>
                )}
              </Disclosure>
            </div>
          ),
        )}
      </div>
      <div className="place-items-end flex">
        <button
          type="button"
          className="flex justify-center items-center bg-jungle-green-500 hover:opacity-75 text-white font-bold py-2 px-4 rounded"
          onClick={() => {
            dispatch({
              type: 'CHECKS_SELECTED',
              payload: { checks: selectedChecks, clusterID: clusterId },
            });
          }}
        >
          {saving ? (
            <span className="px-20">
              <EOS_LOADING_ANIMATED color="green" size={25} />
            </span>
          ) : (
            'Select Checks for Execution'
          )}
        </button>
        {localSavingError && (
          <SavingFailedAlert onClose={() => setLocalSavingError(null)}>
            <p>{savingError}</p>
          </SavingFailedAlert>
        )}
        {localSavingSuccess && selectedChecks.length > 0 && (
          <SuggestTriggeringChecksExecutionAfterSettingsUpdated
            clusterId={clusterId}
            onClose={() => setLocalSavingSuccess(null)}
          />
        )}
      </div>
    </div>
  );
}
