import { faker } from '@faker-js/faker';
import { userFactory } from '@lib/test-utils/factories/users';

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
    const error = {
      message: faker.commerce.productAdjective(),
      code: faker.internet.httpStatusCode(),
    };
    const action = setAuthError({ ...error });

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
    const {
      email,
      username,
      fullname,
      abilities,
      password_change_requested,
      created_at,
      updated_at,
    } = userFactory.build();

    const action = setUser({
      username,
      email,
      fullname,
      abilities,
      password_change_requested,
      created_at,
      updated_at,
    });

    expect(userReducer(initialState, action)).toEqual({
      ...initialState,
      username,
      email,
      fullname,
      abilities,
      password_change_requested,
      created_at,
      updated_at,
    });
  });
});
