import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import axios from 'axios';

import { EOS_LOADING_ANIMATED } from 'eos-icons-react';

import { remove, uniq, toggle, groupBy } from '@lib/lists';

import CatalogContainer from '@components/ChecksCatalog/CatalogContainer';
import {
  SavingFailedAlert,
  SuggestTriggeringChecksExecutionAfterSettingsUpdated,
} from './ClusterSettings';
import ChecksSelectionGroup from './ChecksSelectionGroup';
import ChecksSelectionItem from './ChecksSelectionItem';

const wandaURL = process.env.WANDA_URL;

const ChecksSelectionNew = ({ clusterId, cluster }) => {
  const dispatch = useDispatch();

  const { saving, savingError, savingSuccess } = useSelector(
    (state) => state.clusterChecksSelection
  );

  const [catalogError, setError] = useState(null);
  const [loading, setLoaded] = useState(true);
  const [catalogData, setCatalog] = useState({});
  const [selectedChecks, setSelectedChecks] = useState(
    cluster ? cluster.selected_checks : []
  );
  const [localSavingError, setLocalSavingError] = useState(null);
  const [localSavingSuccess, setLocalSavingSuccess] = useState(null);
  const [groupSelection, setGroupSelection] = useState([]);

  useEffect(() => {
    getCatalog();
  }, []);

  useEffect(() => {
    const groupedCheckSelection = Object.entries(catalogData).map(
      ([group, checks]) => {
        const groupChecks = checks.map((check) => ({
          ...check,
          selected: isSelected(check.id),
        }));
        const allSelected = checks.every((check) => isSelected(check.id));
        const someSelected =
          !allSelected && checks.some((check) => isSelected(check.id));
        return {
          group,
          checks: groupChecks,
          allSelected,
          someSelected,
          noneSelected: !allSelected && !someSelected,
        };
      }
    );
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

  const getCatalog = () => {
    setLoaded(true);
    axios
      .get(`${wandaURL}/api/checks/catalog`)
      .then((catalog) => {
        setCatalog(groupBy(catalog.data.items, 'group'));
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setLoaded(false);
      });
  };

  const isSelected = (checkId) =>
    selectedChecks ? selectedChecks.includes(checkId) : false;

  const dispatchChecksSelected = () => {
    dispatch({
      type: 'CHECKS_SELECTED',
      payload: { checks: selectedChecks, clusterID: clusterId },
    });
  };

  return (
    <CatalogContainer
      onRefresh={() => getCatalog()}
      isCatalogEmpty={catalogData.size === 0}
      catalogError={catalogError}
      loading={loading}
    >
      <div>
        <div className="pb-4">
          {groupSelection?.map(
            (
              { group, checks, allSelected, someSelected, noneSelected },
              idx
            ) => (
              <ChecksSelectionGroup
                key={idx}
                group={group}
                allSelected={allSelected}
                someSelected={someSelected}
                noneSelected={noneSelected}
                onChange={() => {
                  const groupChecks = checks.map((check) => check.id);
                  if (noneSelected || someSelected) {
                    setSelectedChecks(
                      uniq([...selectedChecks, ...groupChecks])
                    );
                  }
                  if (allSelected) {
                    setSelectedChecks(remove(groupChecks, selectedChecks));
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
                    isSelected={check.selected}
                    onChange={() => {
                      setSelectedChecks(toggle(check.id, selectedChecks));
                      setLocalSavingSuccess(null);
                    }}
                  />
                ))}
              </ChecksSelectionGroup>
            )
          )}
        </div>
        <div className="place-items-end flex">
          <button
            className="flex justify-center items-center bg-jungle-green-500 hover:opacity-75 text-white font-bold py-2 px-4 rounded"
            onClick={dispatchChecksSelected}
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
