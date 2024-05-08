/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState, useEffect } from 'react';
import TrentoLogo from '@static/trento-dark.svg';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { initiateLogin } from '@state/user';
import classNames from 'classnames';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { authError, authInProgress, loggedIn } = useSelector(
    (state) => state.user
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (authError && authError.code !== 401) {
      toast.error(
        `An error occurred during login, try again: ${authError.message}`
      );
    }
  }, [authError]);

  useEffect(() => {
    if (loggedIn) {
      const destinationURL = searchParams.get('request_path');
      navigate(destinationURL || '/');
    }
  }, [loggedIn]);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    dispatch(initiateLogin({ username, password }));
  };

  const isUnauthorized = authError && authError.code === 401;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          className="mx-auto h-12 w-auto rounded"
          src={TrentoLogo}
          alt="Trento"
        />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Login to Trento
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleLoginSubmit}>
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  type="text"
                  data-testid="login-username"
                  disabled={authInProgress}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  name="username"
                  autoComplete="username"
                  required
                  className={classNames(
                    'appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-jungle-green-500 focus:border-jungle-green-500 sm:text-sm',
                    { 'border-red-300': isUnauthorized }
                  )}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  type="password"
                  data-testid="login-password"
                  disabled={authInProgress}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className={classNames(
                    'appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-jungle-green-500 focus:border-jungle-green-500 sm:text-sm',
                    {
                      'border-red-300': isUnauthorized,
                      'disabled:opacity-50': authInProgress,
                    }
                  )}
                />
              </div>
            </div>
            {authError && authError.code === 401 && (
              <p className="text-sm text-center text-red-500">
                Invalid credentials
              </p>
            )}
            <div>
              <button
                type="submit"
                disabled={authInProgress}
                data-testid="login-submit"
                className={classNames(
                  'w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-jungle-green-500 hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-jungle-green-500',
                  { 'disabled:opacity-50': authInProgress }
                )}
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
