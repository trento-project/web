import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { performOidcEnrollment } from '@state/user';

function OidCallback() {
  const { search } = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { authError, authInProgress, loggedIn } = useSelector(
    (state) => state.user
  );

  useEffect(() => {
    const params = new URLSearchParams(search);

    // handle different result
    const code = params.get('code');
    const state = params.get('state');

    console.log('code', params.get('code'));
    console.log('state', params.get('state'));

    dispatch(performOidcEnrollment({ state, code }));
  }, [search]);

  useEffect(() => {
    if (loggedIn) {
      navigate('/');
    }
  }, [loggedIn]);

  return <div>oidc callback</div>;
}

export default OidCallback;
