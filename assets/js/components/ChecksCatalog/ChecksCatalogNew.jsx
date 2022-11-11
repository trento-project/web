import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { groupBy } from '@lib/lists';

import { getCatalog } from '@state/selectors/catalog';
import CatalogContainer from './CatalogContainer';
import CheckItem from './CheckItem';

export const ChecksCatalogNew = () => {
  const dispatch = useDispatch();

  const {
    data: catalogData,
    error: catalogError,
    loading: loading,
  } = useSelector(getCatalog());

  useEffect(() => {
    dispatchUpdateCatalog();
  }, [dispatch]);

  const dispatchUpdateCatalog = () => {
    dispatch({
      type: 'UPDATE_CATALOG_NEW',
      payload: {},
    });
  };

  return (
    <CatalogContainer
      onRefresh={() => dispatchUpdateCatalog()}
      isCatalogEmpty={catalogData.length === 0}
      catalogError={catalogError}
      loading={loading}
    >
      <div>
        {Object.entries(groupBy(catalogData, 'group')).map(
          ([group, checks], idx) => (
            <div
              key={idx}
              className="check-group bg-white shadow overflow-hidden sm:rounded-md mb-8"
            >
              <div className="bg-white px-4 py-5 border-b border-gray-200 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {group}
                </h3>
              </div>
              <ul role="list" className="divide-y divide-gray-200">
                {checks.map((check) => (
                  <CheckItem
                    key={check.id}
                    checkID={check.id}
                    premium={check.premium}
                    description={check.description}
                    remediation={check.remediation}
                  />
                ))}
              </ul>
            </div>
          )
        )}
      </div>
    </CatalogContainer>
  );
};
