export const UPDATE_CATALOG = 'UPDATE_CATALOG';

export const updateCatalog = (env = {}) => ({
  type: UPDATE_CATALOG,
  payload: env,
});
