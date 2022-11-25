export const getCatalog = () => (state) => {
  return {
    data: state.catalogNew.data,
    error: state.catalogNew.error,
    loading: state.catalogNew.loading,
  };
};
