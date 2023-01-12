export const PERFORM_LOGIN = 'PERFORM_LOGIN';

export const performLogin = ({ username, password }) => ({
  type: PERFORM_LOGIN,
  payload: { username, password },
});
