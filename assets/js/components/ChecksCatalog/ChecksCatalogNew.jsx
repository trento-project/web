import React, { useState, useEffect } from 'react';

import axios from 'axios';

import CatalogContainer from './CatalogContainer';

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
        setLoaded(false);
        setCatalog(catalog.data);
      })
      .catch(function (error) {
        setLoaded(false);
        setError(error.message);
      });
  };

  return (
    <CatalogContainer
      getCatalog={getCatalog}
      catalogData={catalogData}
      catalogError={catalogError}
      loading={loading}
    />
  );
};
