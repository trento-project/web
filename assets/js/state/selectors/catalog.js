import { createSelector } from '@reduxjs/toolkit';

export const getCatalog = () =>
  createSelector(
    [({ catalog }) => catalog],
    ({ data, filteredCatalog, error, loading }) => ({
      data,
      filteredCatalog,
      error,
      loading,
    })
  );
