/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState, useEffect } from 'react';
import TrentoLogo from '@static/trento-dark.svg';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { initiateLogin } from '@state/user';
import {
  isSingleSignOnEnabled,
  getSingleSignOnLoginUrl,
} from '@lib/auth/config';

import LoginForm from './LoginForm';
import LoginSSO from './LoginSSO';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [totpCodeRequested, setTotpCodeRequested] = useState(false);
  const { authError, authInProgress, loggedIn } = useSelector(
    (state) => state.user
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (authError && authError.code === 422) {
      setTotpCodeRequested(true);
      return;
    }

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
    dispatch(
      initiateLogin({
        username,
        password,
        ...(totpCodeRequested && { totpCode }),
      })
    );
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
          {isSingleSignOnEnabled() ? (
            <LoginSSO singleSignOnUrl={getSingleSignOnLoginUrl()} />
          ) : (
            <LoginForm
              authError={authError}
              authInProgress={authInProgress}
              handleLoginSubmit={handleLoginSubmit}
              isUnauthorized={isUnauthorized}
              password={password}
              setPassword={setPassword}
              setTotpCode={setTotpCode}
              setUsername={setUsername}
              totpCodeRequested={totpCodeRequested}
              totpCode={totpCode}
              username={username}
            />
          )}
        </div>
      </div>
    </div>
  );
}
