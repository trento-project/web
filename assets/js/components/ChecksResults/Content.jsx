import React from 'react';
import { EOS_ERROR } from 'eos-icons-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import NotificationBox from '@components/NotificationBox';

import ChecksSelectionHints from './ChecksSelectionHints';
import { ExecutionIcon } from './ExecutionIcon';
import { description, sortChecks, sortHosts } from './checksUtils';

const Content = ({
  catalog,
  catalogError,
  checksResults = [],
  clusterID,
  executionState,
  filteredChecksyByHost,
  hasAlreadyChecksResults,
  hostnames,
  hosts = [],
  selectedChecks = [],
  onCheckOpen = () => {},
  onCatalogRefresh = () => {},
}) => {
  if (catalogError) {
    return (
      <NotificationBox
        icon={<EOS_ERROR className="m-auto" color="red" size="xl" />}
        text={catalogError}
        buttonText="Try again"
        buttonOnClick={onCatalogRefresh}
      />
    );
  } else if (!hasAlreadyChecksResults) {
    return (
      <ChecksSelectionHints
        clusterId={clusterID}
        selectedChecks={selectedChecks}
      />
    );
  } else {
    const lastExecutionHosts = sortHosts(hosts);

    return lastExecutionHosts.map(
      ({ host_id: hostId, reachable, msg }, idx) => (
        <div key={idx} className="flex flex-col mb-8">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <div className="bg-white px-4 py-5 border-b border-gray-200 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {hostnames(hostId)}
                  </h3>
                  {reachable == false && (
                    <div
                      className="bg-yellow-200 border-yellow-600 text-yellow-600 border-l-4 p-4"
                      role="alert"
                    >
                      <p>{msg}</p>
                    </div>
                  )}
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
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
                        Description
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Result
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortChecks(filteredChecksyByHost(hostId)).map(
                      (checkId) => {
                        const health = checksResults.find(
                          (result) =>
                            result.check_id === checkId &&
                            result.host_id === hostId
                        )?.result;

                        const checkDescription = description(catalog, checkId);

                        return (
                          <tr
                            key={checkId}
                            className="animate-fade tn-check-result-row cursor-pointer hover:bg-emerald-50 ease-in-out duration-300"
                            onClick={() => onCheckOpen(checkId)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-jungle-green-500">
                              {checkId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <ReactMarkdown
                                className="markdown"
                                remarkPlugins={[remarkGfm]}
                              >
                                {checkDescription}
                              </ReactMarkdown>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap content-center">
                              <ExecutionIcon
                                executionState={executionState}
                                health={health}
                              />
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )
    );
  }
};

export default Content;
