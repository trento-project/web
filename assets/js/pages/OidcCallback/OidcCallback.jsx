import React, { useEffect, useState } from 'react';
import TrentoLogo from '@static/trento-dark.svg';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { performSSOEnrollment } from '@state/user';
import { getSingleSignOnLoginUrl } from '@lib/auth/config';
import LoginSSO from '@pages/Login/LoginSSO';
import { getUserProfile } from '@state/selectors/user';

function OidCallback() {
  const { search } = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const { authError, loggedIn } = useSelector(getUserProfile);

  useEffect(() => {
    const params = new URLSearchParams(search);
    const code = params.get('code');
    const state = params.get('state');

    setError(!code || !state);

    dispatch(performSSOEnrollment({ state, code }));
  }, [search]);

  useEffect(() => {
    if (loggedIn) {
      navigate('/');
    }
  }, [loggedIn]);

  if (authError || error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <img
            className="mx-auto h-12 w-auto rounded"
            src={TrentoLogo}
            alt="Trento"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Login Failed
          </h2>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <LoginSSO singleSignOnUrl={getSingleSignOnLoginUrl()} error />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          className="mx-auto h-12 w-auto rounded"
          src={TrentoLogo}
          alt="Trento"
        />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Loading...
        </h2>
      </div>
    </div>
  );
}

export default OidCallback;
