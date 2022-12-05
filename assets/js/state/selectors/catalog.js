export const getCatalog = () => (state) => ({
  data: state.catalogNew.data,
  error: state.catalogNew.error,
  loading: state.catalogNew.loading,
});
