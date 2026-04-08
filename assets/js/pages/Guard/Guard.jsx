import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useNavigate } from 'react-router';
import { setUserAsLogged, setUser as setUserInState } from '@state/user';
import { clearCredentialsFromStore } from '@lib/auth';

export function stripBasePath(requestPath, basePath = '') {
  let result = requestPath;

  const shouldStripBasePath =
    !!basePath &&
    (requestPath === basePath || requestPath.startsWith(`${basePath}/`));

  if (shouldStripBasePath) {
    result = requestPath.slice(basePath.length) || '/';
  }

  return result;
}

export default function Guard({ redirectPath, getUser }) {
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const dispatch = useDispatch();
  const { loggedIn } = useSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    getUser()
      .then((trentoUser) => {
        setUser(trentoUser);
        dispatch(setUserInState(trentoUser));
        setUserLoading(false);
        // If the user in the store is already loggedIn, means
        // that the store is hydrated so the guard is triggered on the spa full loaded
        // no dispatching of logged in action needed
        if (!loggedIn) {
          dispatch(setUserAsLogged());
        }
      })
      .catch(() => {
        setUserLoading(false);
        clearCredentialsFromStore();
      });
  }, [loggedIn]);

  useEffect(() => {
    if (!userLoading && !user) {
      const requestPath = stripBasePath(
        window.location.pathname,
        window.basePath
      );

      const currentLocationPath = new URLSearchParams();
      currentLocationPath.append('request_path', requestPath);
      navigate(`${redirectPath}?${currentLocationPath.toString()}`, {
        replace: true,
      });
    }
  }, [userLoading, user]);

  if (user) {
    return <Outlet />;
  }

  return null;
}
