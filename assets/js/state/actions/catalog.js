export const updateCatalogAction = 'UPDATE_CATALOG_NEW';

export const dispatchUpdateCatalog = () => (dispatch) => {
  dispatch({
    type: updateCatalogAction,
    payload: {},
  });
};
