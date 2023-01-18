export const getCatalog = () => (state) => ({
  data: state.catalog.data,
  error: state.catalog.error,
  loading: state.catalog.loading,
});
