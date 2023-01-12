import { faker } from '@faker-js/faker';

import userReducer, {
  setAuthError,
  setAuthInProgress,
  setUser,
  initialState,
  setUserAsLogged,
} from './user';

describe('user reducer', () => {
  it('should set the authorization flow in progress', () => {
    const action = setAuthInProgress();
    expect(userReducer(initialState, action)).toEqual({
      ...initialState,
      authInProgress: true,
    });
  });

  it('should set the authorization error when setAuthError is dispatched', () => {
    const error = faker.commerce.productAdjective();
    const action = setAuthError({ error });
    expect(userReducer(initialState, action)).toEqual({
      ...initialState,
      authError: error,
    });
  });

  it('should set the user as logged when setUserAsLogged is dispatched', () => {
    const action = setUserAsLogged();

    expect(userReducer(initialState, action)).toEqual({
      ...initialState,
      authError: null,
      authInProgress: false,
      loggedIn: true,
    });
  });

  it('should set the user when setUser is dispatched', () => {
    const action = setUser({ username: 'admin' });
    expect(userReducer(initialState, action)).toEqual({
      ...initialState,
      username: 'admin',
    });
  });
});
