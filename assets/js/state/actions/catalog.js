export const UPDATE_CATALOG = 'UPDATE_CATALOG_NEW';

export const updateCatalog = (env = {}) => ({
  type: UPDATE_CATALOG,
  payload: env,
});
