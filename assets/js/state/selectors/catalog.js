import { createSelector } from '@reduxjs/toolkit';

export const getCatalog = () =>
  createSelector([({ catalog }) => catalog], ({ data, error, loading }) => ({
    data,
    error,
    loading,
  }));
