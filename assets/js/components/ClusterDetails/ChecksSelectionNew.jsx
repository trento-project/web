import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { EOS_LOADING_ANIMATED } from 'eos-icons-react';

import { remove, uniq, toggle, groupBy } from '@lib/lists';
import { getCatalog } from '@state/selectors/catalog';
import { updateCatalog } from '@state/actions/catalog';
import { checksSelected } from '@state/actions/cluster';

import CatalogContainer from '@components/ChecksCatalog/CatalogContainer';
import {
  SavingFailedAlert,
  SuggestTriggeringChecksExecutionAfterSettingsUpdated,
} from './ClusterSettings';
import ChecksSelectionGroup, {
  groupState,
  allSelected,
} from './ChecksSelectionGroup';
import ChecksSelectionItem from './ChecksSelectionItem';

const isSelected = (selectedChecks, checkID) =>
  selectedChecks ? selectedChecks.includes(checkID) : false;

const getGroupSelectedState = function (checks, selectedChecks) {
  if (checks.every(({ id }) => isSelected(selectedChecks, id))) {
    return groupState.All;
  } else if (checks.some((check) => isSelected(selectedChecks, check.id))) {
    return groupState.Some;
  } else {
    return groupState.None;
  }
};

const ChecksSelectionNew = ({ clusterId, cluster }) => {
  const dispatch = useDispatch();

  const { saving, savingError, savingSuccess } = useSelector(
    (state) => state.clusterChecksSelection
  );

  const {
    data: catalogData,
    error: catalogError,
    loading: loading,
  } = useSelector(getCatalog());

  const [selectedChecks, setSelectedChecks] = useState(
    cluster ? cluster.selected_checks : []
  );
  const [localSavingError, setLocalSavingError] = useState(null);
  const [localSavingSuccess, setLocalSavingSuccess] = useState(null);
  const [groupSelection, setGroupSelection] = useState([]);

  useEffect(() => {
    dispatch(updateCatalog());
  }, [dispatch]);

  useEffect(() => {
    const groupedCheckSelection = Object.entries(
      groupBy(catalogData, 'group')
    ).map(([group, checks]) => {
      const groupChecks = checks.map((check) => ({
        ...check,
        selected: isSelected(selectedChecks, check.id),
      }));

      return {
        group,
        checks: groupChecks,
        groupSelected: getGroupSelectedState(checks, selectedChecks),
      };
    });
    setGroupSelection(groupedCheckSelection);
  }, [catalogData, selectedChecks]);

  useEffect(() => {
    setLocalSavingError(savingError);
    setLocalSavingSuccess(savingSuccess);
  }, [savingError, savingSuccess]);

  useEffect(() => {
    if (cluster) {
      setSelectedChecks(cluster.selected_checks ? cluster.selected_checks : []);
    }
  }, [cluster?.selected_checks]);

  useEffect(() => {
    if (loading === true) {
      setLocalSavingError(null);
      setLocalSavingSuccess(null);
    }
  }, [loading]);

  return (
    <CatalogContainer
      onRefresh={() => dispatch(updateCatalog())}
      isCatalogEmpty={catalogData.size === 0}
      catalogError={catalogError}
      loading={loading}
    >
      <div>
        <div className="pb-4">
          {groupSelection?.map(({ group, checks, groupSelected }, idx) => (
            <ChecksSelectionGroup
              key={idx}
              group={group}
              selected={groupSelected}
              onChange={() => {
                const groupChecks = checks.map((check) => check.id);
                if (allSelected(groupSelected)) {
                  setSelectedChecks(remove(groupChecks, selectedChecks));
                } else {
                  setSelectedChecks(uniq([...selectedChecks, ...groupChecks]));
                }
                setLocalSavingSuccess(null);
              }}
            >
              {checks.map((check) => (
                <ChecksSelectionItem
                  key={check.id}
                  checkID={check.id}
                  name={check.name}
                  description={check.description}
                  selected={check.selected}
                  onChange={() => {
                    setSelectedChecks(toggle(check.id, selectedChecks));
                    setLocalSavingSuccess(null);
                  }}
                />
              ))}
            </ChecksSelectionGroup>
          ))}
        </div>
        <div className="place-items-end flex">
          <button
            className="flex justify-center items-center bg-jungle-green-500 hover:opacity-75 text-white font-bold py-2 px-4 rounded"
            onClick={() => dispatch(checksSelected(selectedChecks, clusterId))}
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
    </CatalogContainer>
  );
};

export default ChecksSelectionNew;
