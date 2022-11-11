export const getCatalog = () => (state) => {
  return {
    data: state.catalog_new.data,
    error: state.catalog_new.error,
    loading: state.catalog_new.loading,
  };
};
