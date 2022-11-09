import React, { useState, useEffect } from 'react';

import axios from 'axios';

import { groupBy } from '@lib/lists';

import CatalogContainer from './CatalogContainer';
import CheckItem from './CheckItem';

const wandaURL = process.env.WANDA_URL;

export const ChecksCatalogNew = () => {
  const [catalogError, setError] = useState(null);
  const [loading, setLoaded] = useState(true);
  const [catalogData, setCatalog] = useState([]);

  useEffect(() => {
    getCatalog();
  }, []);

  const getCatalog = () => {
    setLoaded(true);
    axios
      .get(`${wandaURL}/api/checks/catalog`)
      .then((catalog) => {
        setCatalog(catalog.data.items);
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setLoaded(false);
      });
  };

  return (
    <CatalogContainer
      onRefresh={() => getCatalog()}
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
