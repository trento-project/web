import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

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

const ClustersList = () => {
  const clusters = useSelector((state) => state.clustersList.clusters);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col">
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
                      <a
                        href={`/clusters/${cluster.id}/checks`}
                        className="text-jungle-green-500 hover:opacity-75"
                      >
                        Edit checks
                      </a>
                      &nbsp;&nbsp;
                      <a
                        className="text-jungle-green-500 hover:opacity-75"
                        onClick={() => {
                          dispatch({
                            type: 'REQUEST_CHECKS_EXECUTION',
                            payload: {
                              clusterID: cluster.id,
                            },
                          });
                          navigate(`/clusters/${cluster.id}/checks/results`);
                        }}
                      >
                        Start execution
                      </a>
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
