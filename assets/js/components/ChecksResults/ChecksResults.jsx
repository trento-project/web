import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import classNames from 'classnames';

import { getCluster } from '@state/selectors';

import Modal from '@components/Modal';
import LoadingBox from '@components/LoadingBox';

import BackButton from '@components/BackButton';
import WarningBanner from '@components/Banners/WarningBanner';
import { UNKNOWN_PROVIDER } from '@components/ClusterDetails/ClusterSettings';

import { getClusterName } from '@components/ClusterLink';

import ChecksResultFilters, { useFilteredChecks } from './ChecksResultFilters';
import ResultsContainer from './ResultsContainer';
import CheckResult from './CheckResult';
import HostResultsWrapper from './HostResultsWrapper';
import {
  description,
  getHostname,
  findCheck,
  sortHosts,
  sortChecks,
} from './checksUtils';

const truncatedClusterNameClasses =
  'font-bold truncate w-60 inline-block align-top';

const ChecksResults = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState('');
  const dispatch = useDispatch();
  const { clusterID } = useParams();
  const cluster = useSelector(getCluster(clusterID));
  const [hasAlreadyChecksResults, setHasAlreadyChecksResults] = useState(false);

  const [catalogData, catalogError, loading] = useSelector((state) => [
    state.catalog.data,
    state.catalog.error,
    state.catalog.loading,
  ]);

  const dispatchUpdateCatalog = () => {
    dispatch({
      type: 'UPDATE_CATALOG',
      payload: { flat: '', provider: cluster.provider },
    });
  };

  const hosts = cluster?.hosts_executions.slice();

  const hostnames = getHostname(useSelector((state) => state.hostsList.hosts));

  const { filteredChecksyByHost, setFiltersPredicates } =
    useFilteredChecks(cluster);

  const executionState = cluster?.checks_execution;

  useEffect(() => {
    cluster?.provider && dispatchUpdateCatalog();
  }, [cluster?.provider]);

  useEffect(() => {
    setHasAlreadyChecksResults(cluster?.checks_results.length > 0);
  }, [cluster?.checks_results]);

  if (loading || !cluster) {
    return <LoadingBox text="Loading checks catalog..." />;
  }

  return (
    <div>
      <Modal
        title={description(catalogData, selectedCheck)}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <ReactMarkdown className="markdown" remarkPlugins={[remarkGfm]}>
          {findCheck(catalogData, selectedCheck)?.remediation}
        </ReactMarkdown>
      </Modal>
      <BackButton url={`/clusters/${clusterID}`}>
        Back to Cluster Details
      </BackButton>
      <div className="flex mb-4 justify-between">
        <h1 className="text-3xl w-3/5">
          <span className="font-medium">Checks Results for cluster</span>{' '}
          <span
            className={classNames('font-bold', truncatedClusterNameClasses)}
          >
            {getClusterName(cluster)}
          </span>
        </h1>
        <ChecksResultFilters
          onChange={(filtersPredicates) =>
            setFiltersPredicates(filtersPredicates)
          }
        />
      </div>
      {cluster.provider == UNKNOWN_PROVIDER && (
        <WarningBanner>
          The following results are valid for on-premise bare metal platforms.
          <br />
          If you are running your HANA cluster on a different platform, please
          use results with caution
        </WarningBanner>
      )}
      <ResultsContainer
        catalogError={catalogError}
        clusterID={clusterID}
        hasAlreadyChecksResults={hasAlreadyChecksResults}
        selectedChecks={cluster?.selected_checks}
        onCatalogRefresh={dispatchUpdateCatalog}
      >
        {sortHosts(hosts).map(({ host_id: hostID, reachable, msg }, idx) => (
          <HostResultsWrapper
            key={idx}
            hostname={hostnames(hostID)}
            reachable={reachable}
            unreachableMessage={msg}
          >
            {sortChecks(filteredChecksyByHost(hostID)).map((checkId) => {
              const health = cluster.checks_results.find(
                (result) =>
                  result.check_id === checkId && result.host_id === hostID
              )?.result;

              return (
                <CheckResult
                  key={checkId}
                  checkId={checkId}
                  description={description(catalogData, checkId)}
                  executionState={executionState}
                  health={health}
                  onClick={() => {
                    setModalOpen(true);
                    setSelectedCheck(checkId);
                  }}
                />
              );
            })}
          </HostResultsWrapper>
        ))}
      </ResultsContainer>
    </div>
  );
};

export default ChecksResults;
